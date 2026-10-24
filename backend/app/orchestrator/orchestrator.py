import uuid
import httpx
from datetime import datetime, timezone
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database.models import Task, TaskStep, Approval, AuditEvent
from app.orchestrator.agent_base import BaseSpecialistAgent, AgentTaskPlan, AgentResult
from app.agents.document_agent import DocumentAgent
from app.agents.coding_agent import CodingAgent
from app.agents.research_agent import ResearchAgent
from app.agents.desktop_agent import DesktopAgent
from app.agents.study_agent import StudyAgent
from app.agents.genbloc_agent import GenBlocAgent
from app.security.permissions import get_action_spec, RiskLevel, PermissionLevel

class Orchestrator:
    def __init__(self):
        self.agents: dict[str, BaseSpecialistAgent] = {
            "document_agent": DocumentAgent(),
            "coding_agent": CodingAgent(),
            "research_agent": ResearchAgent(),
            "desktop_agent": DesktopAgent(),
            "study_agent": StudyAgent(),
            "genbloc_agent": GenBlocAgent(),
        }
        self.active_jobs: set[str] = set()

    def route_intent(self, prompt: str) -> str:
        import re
        p = prompt.lower()

        def has_any(keywords: list[str]) -> bool:
            for kw in keywords:
                if re.search(r"\b" + re.escape(kw) + r"\b", p):
                    return True
            return False

        if has_any(["slide", "slides", "presentation", "powerpoint", "pptx", "word", "docx", "pdf", "generate doc", "create document"]):
            return "document_agent"
        if has_any(["research", "search", "papers", "sources", "citations", "find online", "who is", "what is", "scholar"]):
            return "research_agent"
        if has_any(["code", "debug", "python", "javascript", "typescript", "bug", "refactor", "test", "tests", "lint", "git"]):
            return "coding_agent"
        if has_any(["open app", "launch", "calc", "notepad", "calculator", "desktop", "explorer"]):
            return "desktop_agent"
        if has_any(["study", "course", "college", "exam", "syllabus", "revision", "flashcard", "quiz", "lecture"]):
            return "study_agent"
        if has_any(["genbloc", "business", "marketing", "pitch", "proposal", "client", "campaign", "social media"]):
            return "genbloc_agent"
        return "general"

    async def call_openai(self, messages: list[dict[str, str]]) -> str:
        if not settings.OPENAI_API_KEY:
            return ""

        url = f"{settings.OPENAI_API_BASE.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 2048,
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            else:
                raise RuntimeError(f"OpenAI API error ({resp.status_code}): {resp.text}")

    async def create_and_execute_task(
        self,
        session: AsyncSession,
        user_prompt: str,
        context: Optional[dict[str, Any]] = None
    ) -> dict[str, Any]:
        ctx = context or {}
        agent_name = self.route_intent(user_prompt)
        task_id = str(uuid.uuid4())

        if agent_name == "general":
            if settings.OPENAI_API_KEY:
                try:
                    response_text = await self.call_openai([
                        {"role": "system", "content": "You are JARVIS, an advanced personal AI operating assistant for Windows. Provide clear, precise, and polite technical responses."},
                        {"role": "user", "content": user_prompt}
                    ])
                    return {
                        "task_id": task_id,
                        "status": "completed",
                        "agent": "general",
                        "response": response_text,
                        "output_files": []
                    }
                except Exception as e:
                    return {
                        "task_id": task_id,
                        "status": "failed",
                        "agent": "general",
                        "error": str(e),
                        "response": f"I encountered an error communicating with the AI service: {e}"
                    }
            else:
                return {
                    "task_id": task_id,
                    "status": "completed",
                    "agent": "general",
                    "response": (
                        f"JARVIS System Online.\n\n"
                        f"I have received your request: \"{user_prompt}\".\n\n"
                        f"All specialist modules (Document Generator, Code Assistant, Safe Automation, "
                        f"Research Engine, Study Planner, and GenBloc Business Suite) are operational.\n"
                        f"Note: To enable cloud LLM chat generation, provide an OpenAI API key in Settings. "
                        f"All local tools and autonomous agents can execute immediately."
                    ),
                    "output_files": []
                }

        agent = self.agents[agent_name]
        plan = await agent.plan(user_prompt, ctx)

        now = datetime.now(timezone.utc)
        db_task = Task(
            id=task_id,
            title=plan.intent,
            description=user_prompt,
            status="running",
            agent_name=agent_name,
            progress=10,
            created_at=now
        )
        session.add(db_task)
        await session.commit()

        audit = AuditEvent(
            id=str(uuid.uuid4()),
            event_type="TASK_CREATED",
            actor=agent_name,
            action=plan.intent,
            details={"task_id": task_id, "steps_count": len(plan.steps)}
        )
        session.add(audit)
        await session.commit()

        if plan.requires_approval:
            db_task.status = "waiting_approval"
            approval = Approval(
                id=str(uuid.uuid4()),
                task_id=task_id,
                action=plan.steps[0].get("tool", "unknown"),
                description=plan.approval_reason or f"Action requires permission ({plan.estimated_risk} risk).",
                risk_level=plan.estimated_risk,
                status="pending",
                details={"steps": plan.steps, "prompt": user_prompt}
            )
            session.add(approval)
            await session.commit()

            return {
                "task_id": task_id,
                "status": "waiting_approval",
                "agent": agent_name,
                "approval_id": approval.id,
                "response": f"Task '{plan.intent}' paused. Waiting for your authorization in the Approval Center.",
                "output_files": []
            }

        output_files = []
        step_results = []
        try:
            total_steps = len(plan.steps)
            for idx, step in enumerate(plan.steps):
                step_record = TaskStep(
                    id=str(uuid.uuid4()),
                    task_id=task_id,
                    step_number=step.get("step_number", idx + 1),
                    title=step.get("title", f"Step {idx + 1}"),
                    status="running",
                    created_at=datetime.now(timezone.utc)
                )
                session.add(step_record)
                await session.commit()

                step_out = await agent.execute_step(step, ctx)
                step_results.append(step_out)

                if isinstance(step_out, dict) and "path" in step_out:
                    output_files.append(step_out["path"])

                step_record.status = "completed"
                step_record.output = str(step_out)
                db_task.progress = int(((idx + 1) / total_steps) * 100)
                await session.commit()

            db_task.status = "completed"
            db_task.result = str(step_results)
            await session.commit()

            summary = f"Successfully executed task via {agent_name}."
            if output_files:
                summary += f"\nGenerated outputs:\n" + "\n".join([f"- `{f}`" for f in output_files])

            return {
                "task_id": task_id,
                "status": "completed",
                "agent": agent_name,
                "response": summary,
                "output_files": output_files,
                "details": step_results
            }

        except Exception as e:
            db_task.status = "failed"
            db_task.error = str(e)
            await session.commit()
            return {
                "task_id": task_id,
                "status": "failed",
                "agent": agent_name,
                "error": str(e),
                "response": f"Execution failed in {agent_name}: {e}",
                "output_files": []
            }

orchestrator = Orchestrator()
