from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Proposal, ProposalChatMessage, User
from db import get_db
from typing import List
from pydantic import BaseModel

router = APIRouter()

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageRead(BaseModel):
    id: int
    sender_id: int
    content: str
    created_at: str

    class Config:
        orm_mode = True

@router.post("/proposals/{proposal_id}/chat", response_model=ChatMessageRead)
def send_message(proposal_id: int, msg: ChatMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    # Only assigned user or manager can send messages
    if current_user.id not in [proposal.owner_id, proposal.assigned_by_manager_id]:
        raise HTTPException(status_code=403, detail="Not authorized")
    visible_to_user = proposal.status != "Approved"
    chat_msg = ProposalChatMessage(
        proposal_id=proposal_id,
        sender_id=current_user.id,
        content=msg.content,
        visible_to_user=visible_to_user
    )
    db.add(chat_msg)
    db.commit()
    db.refresh(chat_msg)
    return chat_msg

@router.get("/proposals/{proposal_id}/chat", response_model=List[ChatMessageRead])
def get_messages(proposal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    # Only assigned user or manager can view messages
    if current_user.id not in [proposal.owner_id, proposal.assigned_by_manager_id]:
        raise HTTPException(status_code=403, detail="Not authorized")
    # If proposal is approved and user is not manager, hide messages
    if proposal.status == "Approved" and current_user.id == proposal.owner_id:
        messages = db.query(ProposalChatMessage).filter_by(proposal_id=proposal_id, visible_to_user=True).all()
    else:
        messages = db.query(ProposalChatMessage).filter_by(proposal_id=proposal_id).all()
    return messages