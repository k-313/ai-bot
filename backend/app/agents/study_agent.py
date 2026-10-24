import uuid
from typing import Any
from app.orchestrator.agent_base import BaseSpecialistAgent, AgentTaskPlan

class StudyAgent(BaseSpecialistAgent):
    name = "study_agent"
    role_description = "Specialist in college course planning, revision schedules, assignment tracking, and technical flashcards."
    allowed_tools = ["generate_pdf", "generate_docx", "write_approved_file"]

    async def plan(self, user_prompt: str, context: dict[str, Any]) -> AgentTaskPlan:
        return AgentTaskPlan(
            task_id=str(uuid.uuid4()),
            agent_name=self.name,
            intent=f"Study Plan / Academic Assistant: {user_prompt[:60]}",
            steps=[
                {
                    "step_number": 1,
                    "title": "Construct study modules, review intervals, and milestones",
                    "tool": "generate_pdf",
                    "args": {
                        "title": context.get("subject", "Computer Science Study Plan"),
                        "filename": context.get("filename", "study_plan.pdf"),
                        "sections": context.get("sections", [
                            {
                                "heading": "Study Schedule & Review Topics",
                                "content": "Structured revision roadmap designed for spaced repetition and mastery.",
                                "bullets": [
                                    "Module 1: Operating Systems & Process Scheduling",
                                    "Module 2: Computer Networks & Socket Programming",
                                    "Module 3: Database Management & Index Optimization",
                                    "Module 4: Distributed Systems & Consensus Algorithms"
                                ]
                            }
                        ])
                    }
                }
            ],
            estimated_risk="low",
            requires_approval=False
        )

    async def execute_step(self, step: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        from app.tools.registry import execute_tool
        res = execute_tool(step.get("tool"), step.get("args", {}))
        if not res.success:
            raise RuntimeError(res.error)
        return res.data
