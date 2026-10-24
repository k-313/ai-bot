from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database.session import get_db
from app.memory.service import MemoryService
from app.schemas.common import MemoryCreateRequest

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("")
async def list_memories(category: Optional[str] = None, session: AsyncSession = Depends(get_db)):
    memories = await MemoryService.get_all(session, category)
    return [
        {
            "id": m.id,
            "category": m.category,
            "key": m.key,
            "value": m.value,
            "relevance": m.relevance,
            "updated_at": m.updated_at.isoformat()
        }
        for m in memories
    ]

@router.post("")
async def create_memory(req: MemoryCreateRequest, session: AsyncSession = Depends(get_db)):
    entry = await MemoryService.add_memory(
        session,
        category=req.category,
        key=req.key,
        value=req.value,
        relevance=req.relevance
    )
    return {
        "id": entry.id,
        "category": entry.category,
        "key": entry.key,
        "value": entry.value,
        "updated_at": entry.updated_at.isoformat()
    }

@router.delete("/{memory_id}")
async def delete_memory(memory_id: str, session: AsyncSession = Depends(get_db)):
    success = await MemoryService.delete_memory(session, memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory entry not found")
    return {"deleted": True, "id": memory_id}

@router.get("/search")
async def search_memory(q: str = Query(...), session: AsyncSession = Depends(get_db)):
    memories = await MemoryService.search_memories(session, q)
    return [
        {
            "id": m.id,
            "category": m.category,
            "key": m.key,
            "value": m.value,
            "relevance": m.relevance,
            "updated_at": m.updated_at.isoformat()
        }
        for m in memories
    ]
