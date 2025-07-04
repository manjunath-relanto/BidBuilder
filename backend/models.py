
# models.py: SQLAlchemy models for BidBuilder backend
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

# --- Analytics Model ---
class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)  # e.g., 'proposalsByStatus'
    data = Column(JSON)  # Store the array or object for each analytics section

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")
    proposals = relationship("Proposal", back_populates="owner")

class Proposal(Base):
    __tablename__ = "proposals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="proposals")
    sections = relationship("ProposalSection", back_populates="proposal")
    comments = relationship("Comment", back_populates="proposal")

class ProposalSection(Base):
    __tablename__ = "proposal_sections"
    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"))
    title = Column(String)
    content = Column(Text)
    proposal = relationship("Proposal", back_populates="sections")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    proposal = relationship("Proposal", back_populates="comments")

class Template(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
