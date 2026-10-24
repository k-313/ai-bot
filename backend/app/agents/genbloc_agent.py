import uuid
from typing import Any
from app.orchestrator.agent_base import BaseSpecialistAgent, AgentTaskPlan

class GenBlocAgent(BaseSpecialistAgent):
    name = "genbloc_agent"
    role_description = "Specialist in business development, market outreach, social media campaigns, and product architecture for GenBloc."
    allowed_tools = ["generate_docx", "generate_pdf", "write_approved_file"]

    async def plan(self, user_prompt: str, context: dict[str, Any]) -> AgentTaskPlan:
        return AgentTaskPlan(
            task_id=str(uuid.uuid4()),
            agent_name=self.name,
            intent=f"GenBloc Business Initiative: {user_prompt[:60]}",
            steps=[
                {
                    "step_number": 1,
                    "title": "Draft strategic pitch, marketing copy, and launch strategy",
                    "tool": "generate_docx",
                    "args": {
                        "title": "GenBloc AI & Blockchain Strategy Document",
                        "filename": context.get("filename", "genbloc_strategy.docx"),
                        "sections": [
                            {
                                "heading": "Executive Summary",
                                "content": "GenBloc accelerates autonomous multi-agent systems and decentralized verification for next-generation developer tooling.",
                                "bullets": [
                                    "Target Audience: Enterprise developers and Web3 innovators",
                                    "Key Value Prop: Verifiable, low-latency agent orchestration",
                                    "Launch Channels: Developer communities, Twitter/X, and tech conferences"
                                ]
                            },
                            {
                                "heading": "Go-To-Market Roadmap",
                                "content": "Phased launch strategy emphasizing open source adoption and enterprise tier security.",
                                "bullets": [
                                    "Phase 1: Open Developer Preview & SDK release",
                                    "Phase 2: Hackathon sponsorships & community workshops",
                                    "Phase 3: Managed enterprise nodes & security audits"
                                ]
                            }
                        ]
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
