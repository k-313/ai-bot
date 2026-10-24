import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.database.models import Conversation, Message
from app.schemas.common import ChatRequest, ChatResponse
from app.orchestrator.orchestrator import orchestrator

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def handle_chat_message(req: ChatRequest, session: AsyncSession = Depends(get_db)):
    conv_id = req.conversation_id
    now = datetime.now(timezone.utc)
    if not conv_id:
        conv_id = str(uuid.uuid4())
        title = req.message[:40] + ("..." if len(req.message) > 40 else "")
        conv = Conversation(id=conv_id, title=title, created_at=now)
        session.add(conv)
        await session.commit()
    else:
        res = await session.execute(select(Conversation).where(Conversation.id == conv_id))
        conv = res.scalar_one_or_none()
        if not conv:
            conv = Conversation(id=conv_id, title=req.message[:40], created_at=now)
            session.add(conv)
            await session.commit()

    user_msg_id = str(uuid.uuid4())
    user_msg = Message(
        id=user_msg_id,
        conversation_id=conv_id,
        role="user",
        content=req.message,
        created_at=now
    )
    session.add(user_msg)
    await session.commit()

    exec_result = await orchestrator.create_and_execute_task(session, req.message, req.context)

    assistant_msg_id = str(uuid.uuid4())
    assistant_msg = Message(
        id=assistant_msg_id,
        conversation_id=conv_id,
        role="assistant",
        content=exec_result.get("response", ""),
        meta_data={
            "agent": exec_result.get("agent", "orchestrator"),
            "task_id": exec_result.get("task_id"),
            "output_files": exec_result.get("output_files", []),
            "status": exec_result.get("status", "completed"),
        },
        created_at=datetime.now(timezone.utc)
    )
    session.add(assistant_msg)
    await session.commit()

    return ChatResponse(
        conversation_id=conv_id,
        message_id=assistant_msg_id,
        role="assistant",
        content=assistant_msg.content,
        agent=exec_result.get("agent", "orchestrator"),
        task_id=exec_result.get("task_id"),
        output_files=exec_result.get("output_files", []),
        status=exec_result.get("status", "completed")
    )

@router.get("/conversations")
async def list_conversations(session: AsyncSession = Depends(get_db)):
    res = await session.execute(select(Conversation).order_by(Conversation.updated_at.desc()))
    convs = res.scalars().all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat()
        }
        for c in convs
    ]

@router.get("/conversations/{conv_id}")
async def get_conversation(conv_id: str, session: AsyncSession = Depends(get_db)):
    res = await session.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    msg_res = await session.execute(
        select(Message).where(Message.conversation_id == conv_id).order_by(Message.created_at.asc())
    )
    msgs = msg_res.scalars().all()
    
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat(),
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "meta_data": m.meta_data,
                "created_at": m.created_at.isoformat()
            }
            for m in msgs
        ]
    }
