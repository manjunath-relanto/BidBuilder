# API Integration Documentation

## Overview
The BidBuilder application now has full API integration for authentication and user management. The frontend communicates with the FastAPI backend through RESTful endpoints.

## Backend API Endpoints

### Authentication Endpoints

#### POST `/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "role": "string" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "string"
}
```

#### POST `/login`
Authenticate a user and get access token.

**Request Body (form-encoded):**
```
username=string&password=string
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```



## Frontend Integration

### Authentication Flow

1. **Login Process:**
   - User enters username and password
   - Frontend calls `/login` endpoint
   - Access token is stored in localStorage
   - User is immediately redirected to dashboard
   - User info is created from login form data

2. **Signup Process:**
   - User fills registration form
   - Frontend calls `/register` endpoint
   - User is automatically logged in
   - Access token is stored in localStorage
   - User is immediately redirected to dashboard
   - User info is created from registration data

3. **Token Management:**
   - Access tokens are stored in localStorage
   - Tokens are automatically included in API requests
   - Invalid tokens are cleared on authentication errors

### API Utility Functions

The frontend uses a centralized API utility (`src/lib/api.js`) that provides:

- **Authentication helpers:** `authAPI.login()`, `authAPI.register()`
- **Automatic token management:** Tokens are automatically included in request headers
- **Error handling:** Consistent error handling across all API calls
- **CORS support:** Backend configured to allow frontend requests

### Security Features

- **JWT Tokens:** Secure token-based authentication
- **Password Hashing:** Passwords are hashed using bcrypt
- **CORS Protection:** Backend configured with proper CORS settings
- **Role-based Access:** User roles determine access levels

## Usage Examples

### Login
```javascript
import { authAPI } from '../lib/api'

try {
  const data = await authAPI.login(username, password)
  localStorage.setItem('access_token', data.access_token)
  // Handle successful login
} catch (error) {
  // Handle login error
}
```

### Register
```javascript
import { authAPI } from '../lib/api'

try {
  const userData = await authAPI.register({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'securepassword',
    role: 'user'
  })
  // Handle successful registration
} catch (error) {
  // Handle registration error
}
```

### Making Authenticated Requests
```javascript
import { proposalsAPI } from '../lib/api'

try {
  const proposals = await proposalsAPI.getAll()
  // Handle proposals data
} catch (error) {
  // Handle error
}
```

## Development Setup

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test API:**
   - Backend runs on `http://localhost:8000`
   - Frontend runs on `http://localhost:5173`
   - API documentation available at `http://localhost:8000/docs`

## Demo Credentials

For testing purposes, you can use:
- **Username:** admin
- **Password:** 1234

Or create a new account using the signup form. 