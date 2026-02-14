# TicketHub API Reference

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourdomain.com`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

---

# Endpoints

## Authentication Endpoints

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Errors:**
- `401`: Invalid email or password
- `400`: Missing required fields

---

### POST /auth/signup
Register a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Smith"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-456",
      "email": "newuser@example.com",
      "name": "Jane Smith",
      "avatar": null,
      "createdAt": "2024-01-15T11:45:00Z",
      "updatedAt": "2024-01-15T11:45:00Z"
    }
  }
}
```

**Errors:**
- `400`: Email already exists
- `400`: Password too weak
- `400`: Missing required fields

---

### POST /auth/google-login
Login with Google OAuth token.

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-789",
      "email": "user@gmail.com",
      "name": "Google User",
      "avatar": "https://lh3.googleusercontent.com/...",
      "googleId": "1234567890",
      "createdAt": "2024-01-15T12:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z"
    }
  }
}
```

**Errors:**
- `401`: Invalid Google token
- `400`: Token expired

---

### GET /auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `401`: Invalid or expired token
- `404`: User not found

---

### POST /auth/logout
Logout and invalidate token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Ticket Endpoints

### POST /tickets/create
Create a new ticket.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Login page not working",
  "description": "Users report that they cannot login with valid credentials. The page shows an error but doesn't specify what's wrong.",
  "priority": "high",
  "category": "Bug",
  "categoryConfidence": 0.95,
  "mlPrediction": {
    "predicted_class": "Bug",
    "confidence_scores": {
      "Bug": 0.95,
      "Feature Request": 0.03,
      "Other": 0.02
    },
    "processed_text": "users report cannot login valid credentials page shows error does not specify wrong",
    "timestamp": "2024-01-15T13:00:00Z"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": "ticket-001",
    "title": "Login page not working",
    "description": "Users report that they cannot login with valid credentials...",
    "status": "pending",
    "priority": "high",
    "category": "Bug",
    "categoryConfidence": 0.95,
    "createdBy": "user-123",
    "createdAt": "2024-01-15T13:00:00Z",
    "updatedAt": "2024-01-15T13:00:00Z"
  }
}
```

**Errors:**
- `401`: Unauthorized
- `400`: Missing required fields
- `400`: Invalid priority level

---

### GET /tickets
Get all tickets for current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of tickets to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "message": "Tickets retrieved",
  "data": [
    {
      "id": "ticket-001",
      "title": "Login page not working",
      "description": "Users report that they cannot login...",
      "status": "pending",
      "priority": "high",
      "category": "Bug",
      "categoryConfidence": 0.95,
      "createdBy": "user-123",
      "createdAt": "2024-01-15T13:00:00Z",
      "updatedAt": "2024-01-15T13:00:00Z"
    },
    {
      "id": "ticket-002",
      "title": "Add dark mode feature",
      "description": "Users request a dark mode for better night usage...",
      "status": "pending",
      "priority": "medium",
      "category": "Feature Request",
      "categoryConfidence": 0.88,
      "createdBy": "user-123",
      "createdAt": "2024-01-14T10:00:00Z",
      "updatedAt": "2024-01-14T10:00:00Z"
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized
- `500`: Server error

---

### GET /tickets/:id
Get a specific ticket by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Ticket ID (required)

**Response (200):**
```json
{
  "success": true,
  "message": "Ticket retrieved",
  "data": {
    "id": "ticket-001",
    "title": "Login page not working",
    "description": "Users report that they cannot login with valid credentials...",
    "status": "pending",
    "priority": "high",
    "category": "Bug",
    "categoryConfidence": 0.95,
    "createdBy": "user-123",
    "createdAt": "2024-01-15T13:00:00Z",
    "updatedAt": "2024-01-15T13:00:00Z",
    "mlPrediction": {
      "predicted_class": "Bug",
      "confidence_scores": {
        "Bug": 0.95,
        "Feature Request": 0.03,
        "Other": 0.02
      },
      "processed_text": "users report cannot login valid credentials...",
      "timestamp": "2024-01-15T13:00:00Z"
    }
  }
}
```

**Errors:**
- `401`: Unauthorized
- `404`: Ticket not found

---

### PUT /tickets/:id
Update a ticket.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Ticket ID (required)

**Request:**
```json
{
  "status": "resolved",
  "priority": "medium",
  "category": "Bug"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": "ticket-001",
    "title": "Login page not working",
    "description": "Users report that they cannot login with valid credentials...",
    "status": "resolved",
    "priority": "medium",
    "category": "Bug",
    "categoryConfidence": 0.95,
    "createdBy": "user-123",
    "createdAt": "2024-01-15T13:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

**Errors:**
- `401`: Unauthorized
- `404`: Ticket not found
- `400`: Invalid status value

---

### GET /tickets/status/:status
Get tickets filtered by status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `status`: "pending" or "resolved" (required)

**Response (200):**
```json
{
  "success": true,
  "message": "Tickets retrieved",
  "data": [
    {
      "id": "ticket-002",
      "title": "Add dark mode feature",
      "description": "Users request a dark mode...",
      "status": "pending",
      "priority": "medium",
      "category": "Feature Request",
      "categoryConfidence": 0.88,
      "createdBy": "user-123",
      "createdAt": "2024-01-14T10:00:00Z",
      "updatedAt": "2024-01-14T10:00:00Z"
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized
- `400`: Invalid status value

---

### DELETE /tickets/:id
Delete a ticket.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Ticket ID (required)

**Response (200):**
```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

**Errors:**
- `401`: Unauthorized
- `404`: Ticket not found

---

## ML Service Endpoints

### POST /predict
Get ML predictions for ticket categorization.

**URL**: `http://localhost:8000/predict`

**Request:**
```json
{
  "text": "The login page is not accepting valid credentials"
}
```

**Response (200):**
```json
{
  "predicted_class": "Bug",
  "confidence_scores": {
    "Bug": 0.95,
    "Feature Request": 0.03,
    "Other": 0.02
  },
  "processed_text": "login page not accepting valid credentials",
  "timestamp": "2024-01-15T13:00:00Z"
}
```

**Errors:**
- `400`: Missing text field
- `500`: Model prediction error

---

## Example Usage

### Complete Workflow

1. **User Registration**
```bash
POST /auth/signup
Body: {
  "email": "user@example.com",
  "password": "secure123",
  "name": "John Doe"
}
```

2. **Get ML Prediction**
```bash
POST http://localhost:8000/predict
Body: {
  "text": "Login page not working"
}
```

3. **Create Ticket**
```bash
POST /tickets/create
Headers: Authorization: Bearer <token>
Body: {
  "title": "Login page issue",
  "description": "The login page is not working",
  "priority": "high",
  "category": "Bug",
  "categoryConfidence": 0.95,
  "mlPrediction": { /* response from /predict */ }
}
```

4. **Get All Tickets**
```bash
GET /tickets
Headers: Authorization: Bearer <token>
```

5. **Update Ticket Status**
```bash
PUT /tickets/ticket-001
Headers: Authorization: Bearer <token>
Body: {
  "status": "resolved"
}
```

---

## Rate Limiting

Consider implementing rate limiting:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints
- 1000 ML predictions per hour

---

## Pagination

For endpoints returning multiple results, implement pagination:
```
GET /tickets?limit=20&offset=0
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150
  }
}
```

---

## Caching

Implement caching for:
- User profile (5 minutes)
- Tickets list (1 minute)
- Individual tickets (5 minutes)

---

## Documentation

For more details on any endpoint, refer to `BACKEND_INTEGRATION.md`.
