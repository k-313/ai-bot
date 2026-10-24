from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone

from app.database.session import get_db
from app.database.models import Task, TaskStep

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("")
async def list_tasks(status: str | None = None, session: AsyncSession = Depends(get_db)):
    stmt = select(Task)
    if status:
        stmt = stmt.where(Task.status == status)
    stmt = stmt.order_by(Task.created_at.desc())
    res = await session.execute(stmt)
    tasks = res.scalars().all()
    
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "agent_name": t.agent_name,
            "progress": t.progress,
            "result": t.result,
            "error": t.error,
            "created_at": t.created_at.isoformat(),
        }
        for t in tasks
    ]

@router.get("/{task_id}")
async def get_task_details(task_id: str, session: AsyncSession = Depends(get_db)):
    res = await session.execute(select(Task).where(Task.id == task_id))
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    steps_res = await session.execute(
        select(TaskStep).where(TaskStep.task_id == task_id).order_by(TaskStep.step_number.asc())
    )
    steps = steps_res.scalars().all()

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "agent_name": task.agent_name,
        "progress": task.progress,
        "result": task.result,
        "error": task.error,
        "created_at": task.created_at.isoformat(),
        "steps": [
            {
                "id": s.id,
                "step_number": s.step_number,
                "title": s.title,
                "status": s.status,
                "output": s.output,
                "error": s.error,
            }
            for s in steps
        ]
    }

@router.post("/{task_id}/cancel")
async def cancel_task(task_id: str, session: AsyncSession = Depends(get_db)):
    res = await session.execute(select(Task).where(Task.id == task_id))
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = "cancelled"
    task.updated_at = datetime.now(timezone.utc)
    await session.commit()
    return {"cancelled": True, "task_id": task_id}

@router.post("/emergency-stop")
async def emergency_stop(session: AsyncSession = Depends(get_db)):
    stmt = update(Task).where(Task.status.in_(["queued", "running", "waiting_approval"])).values(
        status="cancelled",
        error="Emergency Stop invoked by user",
        updated_at=datetime.now(timezone.utc)
    )
    res = await session.execute(stmt)
    await session.commit()
    return {"emergency_stop_triggered": True, "tasks_cancelled": res.rowcount}
