# Auth Module API Documentation

## Overview
The Auth module provides authentication and authorization for the HMS API using JWT tokens.

---

## Endpoints

### 1. **POST /api/v1/auth/login**

Login with username and password to receive a JWT token.

**Request:**
```json
{
  "username": "doctor",
  "password": "doctor123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "doctor",
    "role": "DOCTOR"
  }
}
```

**Error Responses:**
- **400 Bad Request**: Missing username or password
- **401 Unauthorized**: User not found or invalid password

---

### 2. **POST /api/v1/auth/logout**

Logout (stateless endpoint - frontend should clear the token).

**Request:**
```
No body required
```

**Response (200 OK):**
```json
{
  "message": "Logout successful. Please clear the token on your client."
}
```

---

### 3. **POST /api/v1/auth/change-password**

Change user password (requires authentication).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "oldPassword": "doctor123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully",
  "user": {
    "id": 2,
    "username": "doctor",
    "role": "DOCTOR"
  }
}
```

**Error Responses:**
- **400 Bad Request**: Invalid input or password too short
- **401 Unauthorized**: Current password is incorrect
- **404 Not Found**: User not found

---

### 4. **GET /api/v1/auth/me**

Get current authenticated user info.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "message": "User info retrieved",
  "user": {
    "id": 2,
    "username": "doctor",
    "role": "DOCTOR",
    "created_at": "2026-01-02T10:30:00Z"
  }
}
```

**Error Responses:**
- **401 Unauthorized**: Invalid or missing token
- **404 Not Found**: User not found

---

## Test Users (for Development)

| Username  | Password      | Role      |
|-----------|---------------|-----------|
| admin     | admin123      | ADMIN     |
| doctor    | doctor123     | DOCTOR    |
| reception | reception123  | RECEPTION |

---

## How to Use JWT Token

After login, include the token in all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Handling

All errors follow this format:
```json
{
  "message": "Error description"
}
```

---

## Testing in Postman

### 1. Login
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Body (raw JSON):**
  ```json
  {
    "username": "doctor",
    "password": "doctor123"
  }
  ```

### 2. Get Current User
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/auth/me`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer <token_from_login>`

### 3. Change Password
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/auth/change-password`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer <token_from_login>`
- **Body (raw JSON):**
  ```json
  {
    "oldPassword": "doctor123",
    "newPassword": "newPassword456"
  }
  ```

### 4. Logout
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/auth/logout`
- **Body:** None
