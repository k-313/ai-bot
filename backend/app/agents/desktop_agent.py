import uuid
from typing import Any
from app.orchestrator.agent_base import BaseSpecialistAgent, AgentTaskPlan
from app.tools.registry import execute_tool

class DesktopAgent(BaseSpecialistAgent):
    name = "desktop_agent"
    role_description = "Specialist in controlled Windows desktop automation, app management, and UI tasks."
    allowed_tools = ["open_approved_application"]

    async def plan(self, user_prompt: str, context: dict[str, Any]) -> AgentTaskPlan:
        app_name = context.get("app_name", "notepad.exe")
        return AgentTaskPlan(
            task_id=str(uuid.uuid4()),
            agent_name=self.name,
            intent=f"Launch application: {app_name}",
            steps=[
                {
                    "step_number": 1,
                    "title": f"Launch approved application '{app_name}'",
                    "tool": "open_approved_application",
                    "args": {"app_name": app_name}
                }
            ],
            estimated_risk="medium",
            requires_approval=True,
            approval_reason=f"Opening Windows desktop application '{app_name}' requires Level 3 execution approval."
        )

    async def execute_step(self, step: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        tool_name = step.get("tool")
        args = step.get("args", {})
        res = execute_tool(tool_name, args)
        if not res.success:
            raise RuntimeError(res.error)
        return res.data
