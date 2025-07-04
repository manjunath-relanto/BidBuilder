# --- Analytics Data Route (reads from JSON file) ---
import json
import os

# main.py: FastAPI app for BidBuilder backend
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db import Base, engine, get_db
from models import User, Role, Proposal, ProposalSection, Comment, Template
from auth import get_password_hash, verify_password, create_access_token, verify_token, generate_totp_secret, verify_totp
from datetime import timedelta
import uvicorn

Base.metadata.create_all(bind=engine)

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Pydantic schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: Optional[str]
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenMFA(BaseModel):
    access_token: str
    token_type: str
    mfa_secret: Optional[str]

class ProposalCreate(BaseModel):
    title: str
    description: str

class ProposalOut(BaseModel):
    id: int
    title: str
    description: str
    owner_id: int
    class Config:
        orm_mode = True

# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# User registration
@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == user.username) | (User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    # Assign default role
    role = db.query(Role).filter(Role.name == "user").first()
    if not role:
        role = Role(name="user")
        db.add(role)
        db.commit()
        db.refresh(role)
    hashed_pw = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_pw, role_id=role.id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return UserOut(id=db_user.id, username=db_user.username, email=db_user.email, role=role.name)

# User login (with optional MFA)
@app.post("/token", response_model=TokenMFA)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    # MFA: generate secret if not set
    if not hasattr(user, "mfa_secret") or not user.mfa_secret:
        mfa_secret = generate_totp_secret()
        user.mfa_secret = mfa_secret
        db.commit()
    else:
        mfa_secret = user.mfa_secret
    access_token = create_access_token(data={"sub": user.id})
    return TokenMFA(access_token=access_token, token_type="bearer", mfa_secret=mfa_secret)

# MFA verification endpoint
class MFAVerifyRequest(BaseModel):
    token: str
    mfa_code: str

@app.post("/verify_mfa", response_model=Token)
def verify_mfa(payload: MFAVerifyRequest, db: Session = Depends(get_db)):
    user_payload = verify_token(payload.token)
    if not user_payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_payload.get("sub")).first()
    if not user or not user.mfa_secret:
        raise HTTPException(status_code=401, detail="User not found or MFA not set")
    if not verify_totp(payload.mfa_code, user.mfa_secret):
        raise HTTPException(status_code=401, detail="Invalid MFA code")
    access_token = create_access_token(data={"sub": user.id}, expires_delta=timedelta(hours=12))
    return Token(access_token=access_token, token_type="bearer")

# Proposal CRUD
@app.post("/proposals", response_model=ProposalOut)
def create_proposal(proposal: ProposalCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db_proposal = Proposal(title=proposal.title, description=proposal.description, owner_id=user.id)
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal

@app.get("/proposals", response_model=List[ProposalOut])
def list_proposals(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Proposal).filter(Proposal.owner_id == user.id).all()

@app.get("/proposals/{proposal_id}", response_model=ProposalOut)
def get_proposal(proposal_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id, Proposal.owner_id == user.id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@app.delete("/proposals/{proposal_id}")
def delete_proposal(proposal_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id, Proposal.owner_id == user.id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    db.delete(proposal)
    db.commit()
    return {"ok": True}

# Health check
@app.get("/health")
def health_check():
    return {"status": "ok"}

from models import Analytics

# --- Analytics Data Route (reads from DB) ---
@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    keys = [
        "proposalsByStatus",
        "proposalsByPriority",
        "monthlyProposals",
        "teamPerformance",
        "recentActivity",
    ]
    analytics = db.query(Analytics).filter(Analytics.key.in_(keys)).all()
    result = {a.key: a.data for a in analytics}
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
