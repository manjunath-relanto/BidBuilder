# BidBuilder API Security Testing Guide

## Overview

This guide provides comprehensive mock JSON inputs for testing the BidBuilder API's secure authentication and authorization system. The system implements a multi-layered security approach with JWT tokens, MFA (Multi-Factor Authentication), and role-based access control.

## Security Architecture

### 1. Authentication Flow

The authentication system follows a three-step process:

1. **User Registration** (`POST /register`)
   - Creates new user account with bcrypt password hashing
   - Assigns default "user" role
   - Enforces username/email uniqueness

2. **Initial Login** (`POST /token`)
   - Validates credentials against bcrypt hash
   - Generates temporary JWT token (60 minutes)
   - Provides TOTP secret for MFA setup
   - Uses OAuth2PasswordRequestForm for secure credential handling

3. **MFA Verification** (`POST /verify_mfa`)
   - Validates temporary JWT token
   - Verifies TOTP code against stored secret
   - Issues final access token (12 hours expiration)
   - Completes authentication process

### 2. Security Features

#### Password Security
- **Hashing**: bcrypt with salt rounds
- **Verification**: Secure comparison against stored hash
- **Storage**: Never stores plain text passwords

#### JWT Token Security
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 60 minutes (temporary), 12 hours (final)
- **Claims**: User ID, expiration time
- **Secret**: Secure random key (should be environment variable in production)

#### Multi-Factor Authentication (MFA)
- **Type**: TOTP (Time-based One-Time Password)
- **Standard**: RFC 6238
- **Secret**: Base32 encoded, stored securely
- **App**: Compatible with Google Authenticator, Authy, etc.

#### Role-Based Access Control (RBAC)
- **Roles**: user, manager, admin
- **Enforcement**: Database-level and application-level
- **Granularity**: Endpoint-specific permissions

## Detailed Route Analysis

### Public Endpoints (No Authentication Required)

#### 1. Health Check (`GET /health`)
```json
{
  "endpoint": "GET /health",
  "purpose": "System health monitoring",
  "security": "Public endpoint for load balancers",
  "mock_input": {},
  "expected_response": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Authentication Endpoints

#### 1. User Registration (`POST /register`)
**Security Features:**
- Password hashing with bcrypt
- Username/email uniqueness validation
- Default role assignment
- No authentication required (public endpoint)

**Mock Input:**
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Security Considerations:**
- Password strength validation (implemented in frontend)
- Email format validation
- Rate limiting for registration attempts
- CAPTCHA for bot prevention (recommended)

#### 2. User Login (`POST /token`)
**Security Features:**
- OAuth2PasswordRequestForm for secure credential transmission
- bcrypt password verification
- Temporary JWT token generation
- TOTP secret generation/retrieval

**Mock Input:**
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Security Considerations:**
- Brute force protection (rate limiting)
- Account lockout after failed attempts
- Secure session management
- Audit logging of login attempts

#### 3. MFA Verification (`POST /verify_mfa`)
**Security Features:**
- Temporary token validation
- TOTP code verification
- Final access token generation
- Extended token expiration

**Mock Input:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mfa_code": "123456"
}
```

**Security Considerations:**
- TOTP code time window (30 seconds)
- Retry limits for MFA attempts
- Backup codes for account recovery
- MFA bypass for trusted devices (optional)

### Protected Endpoints (Authentication Required)

#### Proposal Management

**1. Create Proposal (`POST /proposals`)**
- **Authentication**: JWT token required
- **Authorization**: Any authenticated user
- **Data Isolation**: User ID automatically assigned

**2. List Proposals (`GET /proposals`)**
- **Authentication**: JWT token required
- **Authorization**: User can only see own proposals
- **Data Isolation**: Database-level filtering

**3. Get Proposal (`GET /proposals/{id}`)**
- **Authentication**: JWT token required
- **Authorization**: Proposal owner only
- **Security**: 404 error for unauthorized access

**4. Delete Proposal (`DELETE /proposals/{id}`)**
- **Authentication**: JWT token required
- **Authorization**: Proposal owner only
- **Cascading**: Deletes related sections and comments

#### Template Management

**1. Create Template (`POST /templates`)**
- **Authentication**: JWT token required
- **Authorization**: Admin or manager role only
- **Validation**: Template name uniqueness

**2. List Templates (`GET /templates`)**
- **Authentication**: JWT token required
- **Authorization**: All authenticated users
- **Purpose**: Template selection for proposal creation

#### Section Management

**1. Assign Section (`POST /sections/assign`)**
- **Authentication**: JWT token required
- **Authorization**: Proposal owner or admin
- **Notifications**: Automatic notification to assigned user
- **Sensitivity**: Special handling for sensitive sections

**2. Comment Section (`POST /sections/comment`)**
- **Authentication**: JWT token required
- **Authorization**: Users with section access
- **Audit**: All comments tracked with user and timestamp

#### Analytics and Search

**1. Search Proposals (`GET /search`)**
- **Authentication**: JWT token required
- **Authorization**: User-accessible proposals only
- **Security**: Query injection protection
- **Performance**: Indexed search fields

**2. Get Analytics (`GET /analytics`)**
- **Authentication**: JWT token required
- **Authorization**: May require admin role for full access
- **Data**: Aggregated from user-accessible proposals only

## Security Testing Scenarios

### 1. Authentication Bypass Tests

**Test Case**: Access protected endpoint without token
```json
{
  "endpoint": "GET /proposals",
  "headers": {},
  "expected_error": "401 Unauthorized - Not authenticated"
}
```

**Test Case**: Use expired token
```json
{
  "endpoint": "GET /proposals",
  "headers": {
    "Authorization": "Bearer expired_token_here"
  },
  "expected_error": "401 Unauthorized - Invalid token"
}
```

### 2. Authorization Tests

**Test Case**: Access other user's proposal
```json
{
  "endpoint": "GET /proposals/999",
  "headers": {
    "Authorization": "Bearer valid_token_for_user_1"
  },
  "expected_error": "404 Not Found - Proposal not found"
}
```

**Test Case**: Regular user accessing admin endpoint
```json
{
  "endpoint": "POST /templates",
  "headers": {
    "Authorization": "Bearer valid_token_for_regular_user"
  },
  "expected_error": "403 Forbidden - Insufficient permissions"
}
```

### 3. MFA Security Tests

**Test Case**: Invalid MFA code
```json
{
  "endpoint": "POST /verify_mfa",
  "mock_input": {
    "token": "valid_temp_token",
    "mfa_code": "000000"
  },
  "expected_error": "401 Unauthorized - Invalid MFA code"
}
```

**Test Case**: Expired temporary token
```json
{
  "endpoint": "POST /verify_mfa",
  "mock_input": {
    "token": "expired_temp_token",
    "mfa_code": "123456"
  },
  "expected_error": "401 Unauthorized - Invalid token"
}
```

## Security Best Practices Implemented

### 1. Input Validation
- Pydantic models for request validation
- SQL injection prevention through ORM
- XSS protection through proper output encoding

### 2. Session Management
- Stateless JWT tokens
- Configurable token expiration
- Secure token storage (client-side)

### 3. Data Protection
- Password hashing with bcrypt
- Sensitive data encryption at rest
- Secure transmission over HTTPS

### 4. Access Control
- Role-based permissions
- Resource-level authorization
- Principle of least privilege

### 5. Audit and Logging
- Authentication event logging
- Failed access attempt tracking
- User action audit trail

## Testing Workflow

### Complete Authentication Flow
1. **Register User**: `POST /register` with valid credentials
2. **Initial Login**: `POST /token` to get temporary token and MFA secret
3. **Setup MFA**: Use authenticator app with provided secret
4. **Verify MFA**: `POST /verify_mfa` with generated code
5. **Use API**: Include final token in Authorization header

### Security Testing Checklist
- [ ] Test all endpoints with missing/invalid tokens
- [ ] Verify role-based access control
- [ ] Test MFA bypass attempts
- [ ] Validate data isolation between users
- [ ] Test input validation and sanitization
- [ ] Verify token expiration handling
- [ ] Test concurrent session handling
- [ ] Validate audit logging functionality

## Production Security Recommendations

### 1. Environment Configuration
- Use environment variables for secrets
- Implement proper secret rotation
- Configure secure database connections

### 2. Infrastructure Security
- Enable HTTPS/TLS encryption
- Implement rate limiting
- Configure proper CORS policies
- Use secure headers (HSTS, CSP, etc.)

### 3. Monitoring and Alerting
- Set up security event monitoring
- Implement automated threat detection
- Configure alerting for suspicious activities

### 4. Regular Security Audits
- Conduct penetration testing
- Review access logs regularly
- Update dependencies for security patches
- Perform code security reviews

This comprehensive testing guide ensures that all security features are properly validated and the authentication system provides robust protection for the BidBuilder application. 