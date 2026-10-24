from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.database.session import get_db
from app.database.models import Approval, Task
from app.schemas.common import ApprovalActionRequest
from app.tools.registry import execute_tool

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("")
async def list_approvals(session: AsyncSession = Depends(get_db)):
    res = await session.execute(select(Approval).order_by(Approval.created_at.desc()))
    approvals = res.scalars().all()
    return [
        {
            "id": a.id,
            "task_id": a.task_id,
            "action": a.action,
            "description": a.description,
            "risk_level": a.risk_level,
            "status": a.status,
            "details": a.details,
            "created_at": a.created_at.isoformat(),
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None
        }
        for a in approvals
    ]

@router.post("/{approval_id}/action")
async def process_approval(
    approval_id: str,
    req: ApprovalActionRequest,
    session: AsyncSession = Depends(get_db)
):
    res = await session.execute(select(Approval).where(Approval.id == approval_id))
    approval = res.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Approval request already {approval.status}")

    approval.status = "approved" if req.decision.lower() == "approve" else "rejected"
    approval.resolved_at = datetime.now(timezone.utc)
    await session.commit()

    if approval.task_id:
        task_res = await session.execute(select(Task).where(Task.id == approval.task_id))
        task = task_res.scalar_one_or_none()
        if task:
            if approval.status == "approved":
                task.status = "running"
                await session.commit()
                details = approval.details or {}
                steps = details.get("steps", [])
                if steps:
                    first_step = steps[0]
                    tool_name = first_step.get("tool")
                    tool_args = first_step.get("args", {})
                    try:
                        exec_res = execute_tool(tool_name, tool_args)
                        if exec_res.success:
                            task.status = "completed"
                            task.progress = 100
                            task.result = str(exec_res.data)
                        else:
                            task.status = "failed"
                            task.error = exec_res.error
                    except Exception as e:
                        task.status = "failed"
                        task.error = str(e)
                else:
                    task.status = "completed"
                    task.progress = 100
            else:
                task.status = "cancelled"
                task.error = "User rejected approval request"
            await session.commit()

    return {
        "approval_id": approval_id,
        "status": approval.status,
        "task_id": approval.task_id
    }
