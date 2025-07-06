# main.py
from __future__ import annotations

import sys, json
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional

sys.path.append(str(Path(__file__).parent.resolve()))
from sqlalchemy.exc import IntegrityError
from sqlalchemy import event

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, field_serializer
import uvicorn
from fastapi import UploadFile, File, Form

from db import Base, engine, get_db, SessionLocal
from summary_generator import generate_summary
from models import (
    User,
    Role,
    Proposal,
    ProposalSection,
    Comment,
    Template,
    Analytics,
    Notification,
)
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from pdf_data_read import summarize_pdf


from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Default Templates
DEFAULT_TEMPLATES = [
    {
        "name": "Enterprise Software Implementation",
        "category": "Software",
        "description": "Comprehensive template for large-scale enterprise software deployments with detailed technical specifications and implementation roadmaps",
        "sections": ["Executive Summary", "Technical Architecture", "Implementation Plan", "Budget Analysis", "Risk Assessment", "Timeline"],
        "estimated_value": 500_000,
        "timeline": "6-12 months",
        "usage_count": 24,
        "content": None,
    },
]

def seed_templates(db: Session) -> None:
    if db.query(Template).count():
        return
    for tpl in DEFAULT_TEMPLATES:
        db.add(
            Template(
                name=tpl["name"],
                category=tpl["category"],
                description=tpl["description"],
                sections=tpl["sections"],
                estimated_value=tpl["estimated_value"],
                timeline=tpl["timeline"],
                usage_count=tpl["usage_count"],
                content=tpl["content"],
            )
        )
    db.commit()

def init_analytics(db: Session) -> None:
    keys = ["proposalsByStatus", "proposalsByPriority", "monthlyProposals", "teamPerformance", "recentActivity"]
    for key in keys:
        if not db.query(Analytics).filter(Analytics.key == key).first():
            db.add(Analytics(key=key, data={}))
    db.commit()

@app.on_event("startup")
def on_startup() -> None:
    db = SessionLocal()
    seed_templates(db)
    init_analytics(db)
    update_analytics(db)
    db.close()

def update_analytics(db: Session) -> None:
    status_counts = db.query(Proposal.status, func.count(Proposal.id)).group_by(Proposal.status).all()
    proposals_by_status = {s or "Unknown": c for s, c in status_counts}

    six_months_ago = datetime.utcnow().replace(day=1)
    monthly = (
        db.query(
            func.strftime("%Y-%m", Proposal.created_at).label("month"),
            func.count(Proposal.id),
        )
        .filter(Proposal.created_at >= six_months_ago)
        .group_by("month")
        .all()
    )
    monthly_dict = {m: c for m, c in monthly}

    team_perf = (
        db.query(User.username, func.count(Proposal.id))
        .join(Proposal, Proposal.owner_id == User.id)
        .group_by(User.username)
        .all()
    )
    team_perf_dict = {u: c for u, c in team_perf}

    mapping = {
        "proposalsByStatus": proposals_by_status,
        "monthlyProposals": monthly_dict,
        "teamPerformance": team_perf_dict,
    }
    for key, data in mapping.items():
        db.query(Analytics).filter(Analytics.key == key).update({"data": data})
    db.commit()

# Pydantic Schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "user"

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: Optional[str]
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    email: str

class ProposalCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    template_id: Optional[int] = None
    estimated_value: Optional[int] = Field(None, alias="estimatedValue")
    timeline: Optional[str] = None
    priority: Optional[str] = None           # New field
    status: Optional[str] = None             # New field
    requirements: Optional[str] = None       # New field
    client_name: Optional[str] = None        # New field

class ProposalOut(BaseModel):
    id: int
    title: str
    description: str
    owner_id: int
    owner_name: Optional[str] = None  # Add this field
    category: Optional[str] = None
    template_id: Optional[int] = None
    estimated_value: Optional[int] = Field(None, alias="estimatedValue")
    timeline: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    requirements: Optional[str] = None
    client_name: Optional[str] = None
    model_config = {"from_attributes": True, "populate_by_name": True}

class ProposalSectionAssignRequest(BaseModel):
    section_id: int
    user_id: int

class ProposalSectionCommentRequest(BaseModel):
    section_id: int
    content: str

class ProposalStatusUpdateRequest(BaseModel):
    proposal_id: int
    status: str

class ProposalTemplateCreate(BaseModel):
    name: str
    category: str
    description: str
    sections: List[str]
    estimated_value: int = Field(..., alias="estimatedValue")
    timeline: str
    content: Optional[str] = None
    model_config = {"populate_by_name": True}

class ProposalTemplateOut(BaseModel):
    id: int
    name: str
    category: str
    description: str
    sections: List[str]
    estimated_value: int = Field(..., alias="estimatedValue")
    timeline: str
    usage_count: int = Field(..., alias="usageCount")
    content: Optional[str] = None
    model_config = {"from_attributes": True, "populate_by_name": True}

class ProposalSectionOut(BaseModel):
    id: int
    title: str
    content: str
    assigned_user_id: Optional[int] = None
    is_sensitive: bool = False
    model_config = {"from_attributes": True}

class CommentOut(BaseModel):
    id: int
    proposal_id: int
    user_id: int
    content: str
    created_at: str
    model_config = {"from_attributes": True}

class NotificationOut(BaseModel):
    id: int
    message: str
    created_at: str
    is_read: bool
    model_config = {"from_attributes": True}

class ProposalAssignmentRequest(BaseModel):
    proposal_id: int
    user_id: int

# Auth Endpoints
@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == user.username) | (User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    allowed = {"user", "manager", "admin"}
    role_name = (user.role or "user").lower()
    if role_name not in allowed:
        role_name = "user"
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name)
        db.add(role)
        db.commit()
        db.refresh(role)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role_id=role.id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"id": db_user.id, "username": db_user.username, "email": db_user.email, "role": role.name}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token(data={"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "email": user.email,
    }

@app.post("/proposals", response_model=ProposalOut)
def create_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role.name != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create proposals")

    db_proposal = Proposal(
        title=proposal.title,
        description=proposal.description,
        owner_id=user.id,
        category=proposal.category,
        template_id=proposal.template_id,
        estimated_value=proposal.estimated_value,
        timeline=proposal.timeline,
        priority=proposal.priority,
        status=proposal.status,
        requirements=proposal.requirements,
        client_name=proposal.client_name,
    )
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    update_analytics(db)
    return db_proposal


@app.post("/proposals/from_template", response_model=ProposalOut)
def create_proposal_from_template(
    template_id: int,
    title: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role.name != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create proposals from templates")

    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    template.usage_count = (template.usage_count or 0) + 1
    db_proposal = Proposal(
        title=title,
        description=template.description or template.content,
        owner_id=user.id,
        template_id=template.id,
        category=template.category,
        estimated_value=template.estimated_value,
        timeline=template.timeline,
    )
    db.add_all([template, db_proposal])
    db.commit()
    db.refresh(db_proposal)
    return db_proposal



@app.post("/templates", response_model=ProposalTemplateOut)
def create_template(
    template: ProposalTemplateCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role.name not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    if db.query(Template).filter(Template.name == template.name).first():
        raise HTTPException(
            status_code=400, detail=f"A template named '{template.name}' already exists."
        )

    db_template = Template(
        name=template.name,
        category=template.category,
        description=template.description,
        sections=template.sections,
        estimated_value=template.estimated_value,
        timeline=template.timeline,
        content=template.content,
        usage_count=0,
    )
    db.add(db_template)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Failed to create template (duplicate name?)"
        )
    db.refresh(db_template)
    return db_template



@app.get("/templates", response_model=List[ProposalTemplateOut])
def list_templates(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Template).all()

# Analytics
@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    rows = db.query(Analytics).all()
    return {
        row.key: json.loads(row.data) if isinstance(row.data, str) else row.data
        for row in rows
    }


# Assign Section to User
@app.post("/sections/assign")
def assign_section(req: ProposalSectionAssignRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    section = db.query(ProposalSection).filter(ProposalSection.id == req.section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    # Only proposal owner or admin/manager can assign
    if section.proposal.owner_id != user.id and user.role.name not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    section.assigned_user_id = req.user_id
    db.commit()
    return {"ok": True}

# Notify assigned user when a section is assigned
@event.listens_for(ProposalSection, 'after_update')
def notify_section_assignment(mapper, connection, target):
    if target.assigned_user_id:
        ins = Notification.__table__.insert().values(
            user_id=target.assigned_user_id,
            message=f"You have been assigned to section '{target.title}' in proposal ID {target.proposal_id}.",
            created_at=datetime.utcnow(),
            is_read=False
        )
        connection.execute(ins)

# Add Comment to Section
@app.post("/sections/comment", response_model=CommentOut)
def comment_section(req: ProposalSectionCommentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    section = db.query(ProposalSection).filter(ProposalSection.id == req.section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    comment = Comment(proposal_id=section.proposal_id, user_id=user.id, content=req.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

# Search Proposals/Sections
@app.get("/search")
def search_proposals(q: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proposals = db.query(Proposal).filter(Proposal.owner_id == user.id, Proposal.description.ilike(f"%{q}%")).all()
    sections = db.query(ProposalSection).join(Proposal).filter(Proposal.owner_id == user.id, ProposalSection.content.ilike(f"%{q}%")).all()
    return {
        "proposals": [{"id": p.id, "title": p.title, "description": p.description} for p in proposals],
        "sections": [{"id": s.id, "title": s.title, "content": s.content, "proposal_id": s.proposal_id} for s in sections]
    }

# Update Proposal Status (Workflow)
@app.post("/proposals/status")
def update_proposal_status(req: ProposalStatusUpdateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proposal = db.query(Proposal).filter(Proposal.id == req.proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    # Only owner or admin/manager can update status
    if proposal.owner_id != user.id and user.role.name not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    proposal.status = req.status
    db.commit()
    return {"ok": True, "status": proposal.status}

# List Notifications
@app.get("/notifications", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()

# Section-level Access Control Example (middleware for sensitive sections)
@app.get("/sections/{section_id}", response_model=ProposalSectionOut)
def get_section(section_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    section = db.query(ProposalSection).filter(ProposalSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    if section.is_sensitive and user.role.name == "junior":
        raise HTTPException(status_code=403, detail="Not authorized to view sensitive section")
    return section

# Generate Proposal Summary (new endpoint)
@app.post("/get_summary")
def get_summary(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Assume generate_summary is a custom function you have implemented elsewhere
    summary = generate_summary(proposal.title, proposal.description)
    return {"summary": summary}

@app.delete("/proposals/{proposal_id}")
def delete_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    # Only owner or admin/manager can delete
    if proposal.owner_id != user.id and user.role.name not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this proposal")
    db.delete(proposal)
    db.commit()
    update_analytics(db)  # Update analytics after commit
    return {"ok": True, "message": "Proposal deleted"}

# List Proposals
@app.get("/list_proposal", response_model=List[ProposalOut])
def list_proposal(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    proposals = db.query(Proposal).filter(Proposal.owner_id == user.id).all()
    return proposals

# Get Proposal by ID
@app.get("/get_proposal_by_id/{proposal_id}", response_model=ProposalOut)
def get_proposal_by_id(
    proposal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id, Proposal.owner_id == user.id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    # Add owner_name to the response
    result = ProposalOut.model_validate(proposal)
    result.owner_name = proposal.owner.username if proposal.owner else None
    return result

# Rebuild forward refs
for m in (ProposalCreate, ProposalOut, ProposalTemplateCreate, ProposalTemplateOut):
    m.model_rebuild()

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()

@app.post("/read_data_from_pdf")
async def read_data_from_pdf(
    file: UploadFile = File(...),
    question: str = Form(...)
):
    """
    Accepts a PDF file and a question, returns the summary generated from the PDF.
    """
    # Save the uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    try:
        summary = summarize_pdf(temp_path, question)
    finally:
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return {"summary": summary}

@app.get("/manager/users", response_model=List[UserOut])
def get_users_under_manager(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.name != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view user list")

    users = db.query(User).join(Role).filter(Role.name == "user").all()

    # Convert SQLAlchemy User objects to Pydantic safely
    return [
        UserOut(
            id=u.id,
            username=u.username,
            email=u.email,
            role=u.role.name if u.role else None
        )
        for u in users
    ]


@app.post("/proposals/assign_to_user")
def assign_proposal_to_user(
    req: ProposalAssignmentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role.name != "manager":
        raise HTTPException(status_code=403, detail="Only managers can assign proposals")

    proposal = db.query(Proposal).filter(Proposal.id == req.proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if proposal.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Proposal not owned by manager")

    assignee = db.query(User).filter(User.id == req.user_id).first()
    if not assignee or assignee.role.name != "user":
        raise HTTPException(status_code=400, detail="Invalid user assignment")

    # Track original manager id
    proposal.owner_id = req.user_id
    proposal.requirements = f"Assigned by manager_id:{user.id}"  # can use separate field or metadata table
    db.commit()
    return {"ok": True, "message": f"Proposal {proposal.id} assigned to {assignee.username}"}


@app.post("/proposals/submit_back_to_manager")
def submit_proposal_back_to_manager(
    proposal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You are not the current owner of this proposal")

    # Extract manager ID (stored earlier)
    if not proposal.requirements or "manager_id:" not in proposal.requirements:
        raise HTTPException(status_code=400, detail="Original manager not found for this proposal")

    try:
        manager_id = int(proposal.requirements.split("manager_id:")[1].split()[0])
    except:
        raise HTTPException(status_code=400, detail="Corrupted manager reference")

    manager = db.query(User).filter(User.id == manager_id).first()
    if not manager or manager.role.name != "manager":
        raise HTTPException(status_code=400, detail="Invalid manager")

    # Reassign ownership
    proposal.owner_id = manager_id
    proposal.requirements = None  # or mark as submitted
    db.commit()
    return {"ok": True, "message": f"Proposal {proposal.id} submitted back to manager"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
