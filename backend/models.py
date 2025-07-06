# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    data = Column(JSON)

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
    category = Column(String, index=True)
    status = Column(String, default="Draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="proposals")

    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    template = relationship("Template", back_populates="proposals")

    estimated_value = Column(Integer, nullable=True)
    timeline = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    requirements = Column(Text, nullable=True)
    client_name = Column(String, nullable=True)

    sections = relationship("ProposalSection", back_populates="proposal")
    comments = relationship("Comment", back_populates="proposal")

class ProposalSection(Base):
    __tablename__ = "proposal_sections"
    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"))
    title = Column(String)
    content = Column(Text)
    is_sensitive = Column(Boolean, default=False)

    proposal = relationship("Proposal", back_populates="sections")
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_user = relationship("User", foreign_keys=[assigned_user_id])

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
    name = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    sections = Column(JSON)               # store list of section titles
    estimated_value = Column(Integer)     # matches DEFAULT_TEMPLATES
    timeline = Column(String)
    usage_count = Column(Integer, default=0)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    proposals = relationship("Proposal", back_populates="template")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
