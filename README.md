# BidBuilder – Enterprise Proposal Management Platform

## Introduction
BidBuilder is a full-stack enterprise proposal management system designed to streamline the creation, collaboration, and management of business proposals for presales and project teams. The platform addresses the challenges of manual proposal workflows, lack of analytics, and inefficient team collaboration by providing a unified, role-based solution with automation, analytics, and secure access.

## Problem Statement
Organizations often struggle with fragmented proposal processes, version control issues, and limited visibility into proposal analytics. BidBuilder solves these problems by offering:
- Centralized proposal and template management
- Real-time analytics and dashboards
- Role-based access and collaboration
- Automated PDF summarization using LLMs
- Secure authentication and notifications

## Tech Stack
- **Frontend:** React 18, Vite 5, Redux Toolkit, Tailwind CSS, Shadcn/ui, Radix UI, Recharts, Lucide React
- **Backend:** FastAPI, SQLAlchemy, Pydantic, Uvicorn, Passlib, python-jose, LangChain, Ollama LLM, pdfplumber
- **Database:** SQLite (default, can be swapped for PostgreSQL)

## Solution Overview
BidBuilder provides:
- **Authentication & RBAC:** Secure login, JWT tokens, MFA, and role-based permissions (admin, manager, user)
- **Proposal Management:** Create, assign, edit, and track proposals with section-level collaboration
- **Template System:** Reusable templates for rapid proposal generation
- **Analytics Dashboard:** Visualize KPIs, trends, and team performance
- **Notifications:** Real-time updates for assignments and comments
- **PDF Summarization:** Upload PDFs and get AI-generated summaries (Ollama + LangChain)

## Project Structure
```
BidBuilder/
  backend/    # FastAPI backend
  frontend/   # React + Vite frontend
```

---

# Frontend

## Features
- Authentication, role-based access
- Proposal and template management
- Analytics dashboard with charts
- Team collaboration and notifications
- Responsive UI

## Requirements
- Node.js 18+
- npm or yarn

## Setup
```bash
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

## Documentation
- See `frontend/README.md` for detailed usage, customization, and scripts.

---

# Backend

## Features
- FastAPI REST API
- User, proposal, template, analytics, and notification models
- JWT authentication, MFA, RBAC
- PDF summarization with LLMs
- Analytics endpoints

## Requirements
- Python 3.9+
- See `backend/requirements.txt` for dependencies

## Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Documentation
- See `backend/BACKEND_README.md` for technical details
- See `backend/Backend_Usage_documentation.MD` for API usage examples
- See `backend/SECURITY_TESTING_GUIDE.md` for security and testing guidance

---

# Further Information
- For advanced usage, customization, and security, refer to the `.md` documentation files in both `frontend/` and `backend/` directories.
- For questions or contributions, contact the maintainers or open an issue.

---

**Built with ❤️ by the BidBuilder Team** 