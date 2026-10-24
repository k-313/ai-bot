from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel

class AgentTaskPlan(BaseModel):
    task_id: str
    agent_name: str
    intent: str
    steps: list[dict[str, Any]]
    estimated_risk: str = "low"
    requires_approval: bool = False
    approval_reason: str | None = None

class AgentResult(BaseModel):
    agent_name: str
    success: bool
    summary: str
    output_files: list[str] = []
    data: Any = None
    error: str | None = None

class BaseSpecialistAgent(ABC):
    name: str
    role_description: str
    allowed_tools: list[str]

    @abstractmethod
    async def plan(self, user_prompt: str, context: dict[str, Any]) -> AgentTaskPlan:
        pass

    @abstractmethod
    async def execute_step(self, step: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        pass
