import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import MemoryEntry
from app.security.sanitizer import redact_secrets

class MemoryService:
    @staticmethod
    async def get_all(session: AsyncSession, category: Optional[str] = None) -> list[MemoryEntry]:
        stmt = select(MemoryEntry)
        if category:
            stmt = stmt.where(MemoryEntry.category == category)
        stmt = stmt.order_by(MemoryEntry.updated_at.desc())
        res = await session.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def add_memory(
        session: AsyncSession,
        category: str,
        key: str,
        value: str,
        relevance: float = 1.0
    ) -> MemoryEntry:
        clean_value = redact_secrets(value)
        now = datetime.now(timezone.utc)
        entry = MemoryEntry(
            id=str(uuid.uuid4()),
            category=category,
            key=key,
            value=clean_value,
            relevance=relevance,
            created_at=now,
            updated_at=now
        )
        session.add(entry)
        await session.commit()
        await session.refresh(entry)
        return entry

    @staticmethod
    async def update_memory(
        session: AsyncSession,
        memory_id: str,
        value: str,
        category: Optional[str] = None
    ) -> Optional[MemoryEntry]:
        stmt = select(MemoryEntry).where(MemoryEntry.id == memory_id)
        res = await session.execute(stmt)
        entry = res.scalar_one_or_none()
        if not entry:
            return None
        
        entry.value = redact_secrets(value)
        if category:
            entry.category = category
        entry.updated_at = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(entry)
        return entry

    @staticmethod
    async def delete_memory(session: AsyncSession, memory_id: str) -> bool:
        stmt = delete(MemoryEntry).where(MemoryEntry.id == memory_id)
        res = await session.execute(stmt)
        await session.commit()
        return res.rowcount > 0

    @staticmethod
    async def search_memories(session: AsyncSession, query: str) -> list[MemoryEntry]:
        q = f"%{query.lower()}%"
        stmt = select(MemoryEntry).where(
            (MemoryEntry.key.ilike(q)) | (MemoryEntry.value.ilike(q))
        ).order_by(MemoryEntry.relevance.desc())
        res = await session.execute(stmt)
        return list(res.scalars().all())
