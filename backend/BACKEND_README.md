# Backend Technical Documentation

## Overview
This backend is a FastAPI-based application for managing proposals, users, templates, analytics, and notifications. It uses SQLAlchemy ORM for database interactions and supports user authentication, role-based access, and PDF summarization using LLMs (Ollama via LangChain).

---

## Table of Contents
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [PDF Summarization](#pdf-summarization)
- [Development Notes](#development-notes)

---

## Features
- User registration, login, and JWT authentication
- Role-based access control (user, manager, admin)
- Proposal creation, assignment, and workflow
- Template management for proposals
- Section-level assignment and comments
- Analytics and notifications
- PDF file upload and automatic summarization using LLMs

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **(Optional) Set up Ollama and LangChain for PDF summarization.**
   - Ensure Ollama is running locally (default: http://localhost:11434)
   - Install required LangChain and PDF libraries

---

## Environment Variables
- `DATABASE_URL` (optional): Set to override the default SQLite database.
- `SECRET_KEY`: Used for JWT token generation (set in `config.py` or as env var).

---

## Database
- Default: SQLite (`bidbuilder.db`)
- ORM: SQLAlchemy
- Models: User, Role, Proposal, ProposalSection, Comment, Template, Analytics, Notification
- To reset the database (dev only): delete `bidbuilder.db` and restart the server.
- For production, use Alembic for migrations.

---

## Running the Server
```bash
uvicorn main:app --reload
```
- The server will run at `http://127.0.0.1:8000/`
- API docs available at `/docs`

---

## API Endpoints (Key)

### Auth
- `POST /register` — Register a new user
- `POST /login` — Login and get JWT token

### Proposals
- `POST /proposals` — Create a proposal (manager only)
- `GET /list_proposal` — List proposals for current user
- `GET /get_proposal_by_id/{proposal_id}` — Get proposal details (includes owner and assignee info)
- `POST /proposals/assign_to_user` — Assign proposal to a user (manager only)
- `POST /proposals/submit_back_to_manager` — User submits proposal back to manager
- `DELETE /proposals/{proposal_id}` — Delete a proposal

### Templates
- `POST /templates` — Create a template (admin/manager)
- `GET /templates` — List all templates

### Sections & Comments
- `POST /sections/assign` — Assign section to user
- `POST /sections/comment` — Add comment to section
- `GET /sections/{section_id}` — Get section details

### Analytics & Notifications
- `GET /analytics` — Get analytics data
- `GET /notifications` — List notifications for current user

### PDF Summarization
- `POST /read_data_from_pdf` — Upload a PDF and get a summary (uses LLM)

---

## PDF Summarization
- Uses `pdf_data_read.py` to extract and summarize PDF content.
- Requires a running Ollama LLM instance and LangChain libraries.
- Endpoint: `POST /read_data_from_pdf` (multipart/form-data)

---

## Development Notes
- **Database migrations:** Use Alembic for schema changes in production.
- **Linter:** Run a linter (e.g., mypy, flake8) to catch type issues.
- **Testing:** Add unit and integration tests for endpoints and business logic.
- **Security:** Ensure `SECRET_KEY` is kept secret and use HTTPS in production.
- **Extensibility:** The codebase is modular; add new features by extending models and routers.

---

## Contact
For questions or contributions, please contact the backend maintainers or open an issue in the repository. 