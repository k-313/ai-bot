import uuid
from typing import Any
from app.orchestrator.agent_base import BaseSpecialistAgent, AgentTaskPlan
from app.tools.registry import execute_tool

class DocumentAgent(BaseSpecialistAgent):
    name = "document_agent"
    role_description = "Specialist in generating high-quality PowerPoint presentations, Word documents, and PDF reports."
    allowed_tools = ["generate_pptx", "generate_docx", "generate_pdf", "create_output_folder"]

    async def plan(self, user_prompt: str, context: dict[str, Any]) -> AgentTaskPlan:
        prompt_lower = user_prompt.lower()
        doc_type = "pdf"
        if "powerpoint" in prompt_lower or "pptx" in prompt_lower or "presentation" in prompt_lower or "slide" in prompt_lower:
            doc_type = "pptx"
        elif "word" in prompt_lower or "docx" in prompt_lower:
            doc_type = "docx"

        title = context.get("title", "JARVIS Generated Document")
        filename = context.get("filename", f"document_{uuid.uuid4().hex[:8]}")

        return AgentTaskPlan(
            task_id=str(uuid.uuid4()),
            agent_name=self.name,
            intent=f"Generate {doc_type.upper()} document: {title}",
            steps=[
                {
                    "step_number": 1,
                    "title": f"Create {doc_type.upper()} document",
                    "tool": f"generate_{doc_type}",
                    "args": {
                        "title": title,
                        "filename": filename,
                        "content": context.get("sections", []),
                        "sections": context.get("sections", []),
                        "subtitle": context.get("subtitle", "Prepared by JARVIS"),
                        "slides": context.get("slides", [
                            {"title": "Overview", "bullets": ["Context and objectives", "Core technical milestones", "Next steps"]}
                        ]),
                    }
                }
            ],
            estimated_risk="low",
            requires_approval=False
        )

    async def execute_step(self, step: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        tool_name = step.get("tool")
        args = step.get("args", {})
        
        if tool_name == "generate_pptx":
            clean_args = {
                "title": args.get("title", "Presentation"),
                "subtitle": args.get("subtitle", ""),
                "slides": args.get("slides", []),
                "filename": args.get("filename", "presentation.pptx")
            }
        elif tool_name in ["generate_docx", "generate_pdf"]:
            clean_args = {
                "title": args.get("title", "Document"),
                "sections": args.get("sections", args.get("content", [])),
                "filename": args.get("filename", f"doc.{tool_name.split('_')[1]}")
            }
        else:
            clean_args = args

        res = execute_tool(tool_name, clean_args)
        if not res.success:
            raise RuntimeError(res.error)
        return res.data
