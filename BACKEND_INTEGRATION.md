# Backend Integration Guide

This document explains how to integrate your backend services with the TicketHub frontend application.

## Environment Variables

Set up these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Backend Configuration

The frontend expects your backend to run on port 3000 and expose the following API endpoints:

### Authentication Endpoints

#### Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "John Doe",
        "avatar": "avatar_url",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    }
  }
  ```

#### Signup
- **Endpoint**: `POST /auth/signup`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response**: Same as login

#### Google Login
- **Endpoint**: `POST /auth/google-login`
- **Request Body**:
  ```json
  {
    "idToken": "google_id_token_from_frontend"
  }
  ```
- **Response**: Same as login

#### Get Profile
- **Endpoint**: `GET /auth/profile`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved",
    "data": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "avatar_url",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### Logout
- **Endpoint**: `POST /auth/logout`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

### Ticket Endpoints

#### Create Ticket
- **Endpoint**: `POST /tickets/create`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "title": "Login page bug",
    "description": "The login page is not accepting valid credentials",
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
      "processed_text": "processed text",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Ticket created successfully",
    "data": {
      "id": "ticket-id",
      "title": "Login page bug",
      "description": "The login page is not accepting valid credentials",
      "status": "pending",
      "priority": "high",
      "category": "Bug",
      "categoryConfidence": 0.95,
      "createdBy": "user-id",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### Get All Tickets
- **Endpoint**: `GET /tickets`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Tickets retrieved",
    "data": [
      {
        "id": "ticket-id",
        "title": "Login page bug",
        "description": "The login page is not accepting valid credentials",
        "status": "pending",
        "priority": "high",
        "category": "Bug",
        "categoryConfidence": 0.95,
        "createdBy": "user-id",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

#### Get Ticket by ID
- **Endpoint**: `GET /tickets/:id`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Single ticket object

#### Update Ticket
- **Endpoint**: `PUT /tickets/:id`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "status": "resolved",
    "priority": "medium",
    "category": "Updated Category"
  }
  ```
- **Response**: Updated ticket object

#### Get Tickets by Status
- **Endpoint**: `GET /tickets/status/:status`
- **Headers**: `Authorization: Bearer {token}`
- **Params**: status can be "pending" or "resolved"
- **Response**: Array of tickets with specified status

#### Delete Ticket
- **Endpoint**: `DELETE /tickets/:id`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Ticket deleted successfully"
  }
  ```

## ML Service Configuration

The ML service runs on port 8000 and handles ticket categorization:

### Prediction Endpoint
- **Endpoint**: `POST /predict`
- **Request Body**:
  ```json
  {
    "text": "The login page is not accepting valid credentials"
  }
  ```
- **Response**:
  ```json
  {
    "predicted_class": "Bug",
    "confidence_scores": {
      "Bug": 0.95,
      "Feature Request": 0.03,
      "Other": 0.02
    },
    "processed_text": "processed text from ml model",
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

## Backend Implementation Requirements

### Required Features

1. **Authentication**
   - JWT token-based authentication
   - Support for email/password login and Google OAuth
   - Token validation and refresh mechanism

2. **User Management**
   - User creation and profile management
   - User data persistence

3. **Ticket Management**
   - CRUD operations for tickets
   - Ticket status tracking (pending/resolved)
   - Priority levels (low/medium/high)
   - Category storage from ML predictions
   - Confidence score storage

4. **Data Validation**
   - Input validation for all endpoints
   - Email format validation
   - Password strength validation

5. **Error Handling**
   - Proper HTTP status codes
   - Descriptive error messages
   - Request/response logging

## Frontend API Client Usage

The frontend provides a built-in API client for making requests:

```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/config';

// Set token after login
apiClient.setToken(token);

// Make GET request
const response = await apiClient.get('/tickets');

// Make POST request
const response = await apiClient.post('/tickets/create', {
  title: 'New Ticket',
  description: 'Description',
  priority: 'high'
});

// Make PUT request
const response = await apiClient.put('/tickets/1', {
  status: 'resolved'
});

// Make DELETE request
const response = await apiClient.delete('/tickets/1');
```

## Testing the Integration

1. Start the ML service on port 8000
2. Start the backend on port 3000
3. Start the Next.js frontend: `npm run dev`
4. Open http://localhost:3000 in your browser
5. Create an account or login
6. Create a ticket to test the full flow

## Troubleshooting

- **CORS errors**: Ensure backend has proper CORS headers configured
- **Auth token not persisted**: Check localStorage access and JWT expiration
- **ML predictions failing**: Verify ML service is running on port 8000
- **API calls timing out**: Check backend service is running on port 3000
