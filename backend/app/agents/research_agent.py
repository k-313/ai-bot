import uuid
from typing import Any
from app.orchestrator.agent_base import BaseSpecialistAgent, AgentTaskPlan
from app.tools.registry import execute_tool

class ResearchAgent(BaseSpecialistAgent):
    name = "research_agent"
    role_description = "Specialist in web research, technical documentation synthesis, and verified citations."
    allowed_tools = ["search_web"]

    async def plan(self, user_prompt: str, context: dict[str, Any]) -> AgentTaskPlan:
        return AgentTaskPlan(
            task_id=str(uuid.uuid4()),
            agent_name=self.name,
            intent=f"Research: {user_prompt[:60]}",
            steps=[
                {
                    "step_number": 1,
                    "title": "Perform structured search and gather citations",
                    "tool": "search_web",
                    "args": {"query": context.get("query", user_prompt)}
                }
            ],
            estimated_risk="low",
            requires_approval=False
        )

    async def execute_step(self, step: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        tool_name = step.get("tool")
        args = step.get("args", {})
        res = execute_tool(tool_name, args)
        if not res.success:
            raise RuntimeError(res.error)
        return res.data
