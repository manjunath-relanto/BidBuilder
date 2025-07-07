# Usage Guide: Backend API

This guide explains how to use the backend API for proposal management, user authentication, template handling, section assignment, analytics, notifications, and PDF summarization.

---

## Table of Contents
- [Authentication](#authentication)
- [Proposals](#proposals)
- [Templates](#templates)
- [Sections & Comments](#sections--comments)
- [Analytics & Notifications](#analytics--notifications)
- [PDF Summarization](#pdf-summarization)
- [Example API Calls](#example-api-calls)

---

## Authentication

### Register
- **Endpoint:** `POST /register`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "yourpassword",
    "role": "user"  // or "manager", "admin"
  }
  ```
- **Response:** User info

### Login
- **Endpoint:** `POST /login`
- **Body (form):**
  - `username`: your username
  - `password`: your password
- **Response:** JWT token and user info

**Note:** Use the returned `access_token` as a Bearer token in the `Authorization` header for all protected endpoints:
```
Authorization: Bearer <access_token>
```

---

## Proposals

### Create Proposal (Manager Only)
- **Endpoint:** `POST /proposals`
- **Body:**
  ```json
  {
    "title": "CRM Implementation",
    "description": "A proposal for CRM software deployment.",
    "category": "Software",
    "template_id": 1,
    "estimatedValue": 100000,
    "timeline": "3 months",
    "priority": "High",
    "status": "Draft",
    "requirements": "",
    "client_name": "Acme Corp"
  }
  ```
- **Response:** Proposal details

### List Proposals
- **Endpoint:** `GET /list_proposal`
- **Response:** List of proposals for the current user

### Get Proposal by ID
- **Endpoint:** `GET /get_proposal_by_id/{proposal_id}`
- **Response:** Proposal details, including `owner_name` and `assignee_name`

### Assign Proposal to User (Manager Only)
- **Endpoint:** `POST /proposals/assign_to_user`
- **Body:**
  ```json
  {
    "proposal_id": 1,
    "user_id": 2
  }
  ```
- **Response:** Assignment confirmation, assignee info

### Submit Proposal Back to Manager (User)
- **Endpoint:** `POST /proposals/submit_back_to_manager`
- **Body:**
  - `proposal_id`: ID of the proposal
- **Response:** Confirmation message

### Delete Proposal
- **Endpoint:** `DELETE /proposals/{proposal_id}`
- **Response:** Confirmation message

---

## Templates

### Create Template (Admin/Manager)
- **Endpoint:** `POST /templates`
- **Body:**
  ```json
  {
    "name": "Enterprise Software Implementation",
    "category": "Software",
    "description": "Comprehensive template...",
    "sections": ["Executive Summary", "Technical Architecture"],
    "estimatedValue": 500000,
    "timeline": "6-12 months",
    "content": "..."
  }
  ```
- **Response:** Template details

### List Templates
- **Endpoint:** `GET /templates`
- **Response:** List of templates

---

## Sections & Comments

### Assign Section to User
- **Endpoint:** `POST /sections/assign`
- **Body:**
  ```json
  {
    "section_id": 1,
    "user_id": 2
  }
  ```
- **Response:** Confirmation

### Add Comment to Section
- **Endpoint:** `POST /sections/comment`
- **Body:**
  ```json
  {
    "section_id": 1,
    "content": "Please review this section."
  }
  ```
- **Response:** Comment details

### Get Section Details
- **Endpoint:** `GET /sections/{section_id}`
- **Response:** Section info

---

## Analytics & Notifications

### Get Analytics
- **Endpoint:** `GET /analytics`
- **Response:** Analytics data

### List Notifications
- **Endpoint:** `GET /notifications`
- **Response:** List of notifications for the current user

---

## PDF Summarization

### Upload PDF and Get Summary
- **Endpoint:** `POST /read_data_from_pdf`
- **Form Data:**
  - `file`: PDF file to upload
- **Response:**
  ```json
  {
    "summary": "4-5 line summary of the PDF content."
  }
  ```

---

## Example API Calls

### Using `curl`

**Register:**
```bash
curl -X POST "http://localhost:8000/register" -H "Content-Type: application/json" -d '{"username":"jane","email":"jane@example.com","password":"pass123","role":"manager"}'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/login" -H "Content-Type: application/x-www-form-urlencoded" -d "username=jane&password=pass123"
```

**Create Proposal:**
```bash
curl -X POST "http://localhost:8000/proposals" -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"title":"CRM","description":"..."}'
```

**Upload PDF for Summary:**
```bash
curl -X POST "http://localhost:8000/read_data_from_pdf" -H "Authorization: Bearer <token>" -F "file=@/path/to/file.pdf"
```

---

## Notes
- Always include the JWT token in the `Authorization` header for protected endpoints.
- Use `/docs` for interactive API documentation and testing.
- For more details, see `BACKEND_README.md`. 