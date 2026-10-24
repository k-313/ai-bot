import uuid
from typing import Any
from app.orchestrator.agent_base import BaseSpecialistAgent, AgentTaskPlan
from app.tools.registry import execute_tool

class CodingAgent(BaseSpecialistAgent):
    name = "coding_agent"
    role_description = "Specialist in analyzing source code, debugging, generating modules, and running authorized tests."
    allowed_tools = ["list_approved_files", "read_approved_text_file", "write_approved_file", "run_approved_test"]

    async def plan(self, user_prompt: str, context: dict[str, Any]) -> AgentTaskPlan:
        prompt_lower = user_prompt.lower()
        requires_approval = "run test" in prompt_lower or "execute" in prompt_lower
        
        steps = []
        if "test" in prompt_lower:
            steps.append({
                "step_number": 1,
                "title": "Execute approved project test suite",
                "tool": "run_approved_test",
                "args": {"project_path": context.get("path", "workspace"), "command": "pytest"}
            })
        elif "write" in prompt_lower or "create file" in prompt_lower:
            steps.append({
                "step_number": 1,
                "title": "Write source code file",
                "tool": "write_approved_file",
                "args": {
                    "filepath": context.get("filepath", "module.py"),
                    "content": context.get("content", "# Created by JARVIS Coding Agent\n")
                }
            })
        else:
            steps.append({
                "step_number": 1,
                "title": "Inspect workspace files",
                "tool": "list_approved_files",
                "args": {"folder": "workspace"}
            })

        return AgentTaskPlan(
            task_id=str(uuid.uuid4()),
            agent_name=self.name,
            intent=f"Code assistance: {user_prompt[:60]}",
            steps=steps,
            estimated_risk="medium" if requires_approval else "low",
            requires_approval=requires_approval,
            approval_reason="Running test suites executes local processes within the workspace." if requires_approval else None
        )

    async def execute_step(self, step: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        tool_name = step.get("tool")
        args = step.get("args", {})
        res = execute_tool(tool_name, args)
        if not res.success:
            raise RuntimeError(res.error)
        return res.data
