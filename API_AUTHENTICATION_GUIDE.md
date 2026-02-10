# 🔐 Authentication API Documentation

## Overview
This API uses **JWT (JSON Web Tokens)** for authentication with **Role-Based Access Control (RBAC)**. Users can have either regular user or admin privileges.

---

## 📌 Authentication Flow

```
1. User Registration/Login
   ↓
2. Server generates JWT token
   ↓
3. Client stores token (localStorage/sessionStorage)
   ↓
4. Client includes token in Authorization header
   ↓
5. Server verifies token on protected routes
```

---

## 🔑 API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "isAdmin": false
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Validation failed (missing fields)
- `409` - User already exists
- `500` - Server error

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "isAdmin": false,
    "profilePicture": "https://res.cloudinary.com/...",
    "followers": [],
    "followings": []
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Validation failed
- `404` - Username not found
- `401` - Invalid password
- `500` - Server error

---

## 🔐 Protected Routes (Require Authentication)

### Using the Token

Include the JWT token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example using Fetch API:**
```javascript
fetch('http://localhost:8800/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    userId: "507f1f77bcf86cd799439011",
    desc: "My post content"
  })
})
```

**Example using Axios:**
```javascript
axios.post('http://localhost:8800/api/posts', 
  { userId: "507f...", desc: "My post" },
  {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  }
)
```

---

## 👥 User Management Endpoints

### 3. Update User Profile

**Endpoint:** `PUT /api/users/:id`  
**Authentication:** Required (user or admin)

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "desc": "Updated bio",
  "city": "San Francisco",
  "relationship": 1
}
```

**Response (200 OK):**
```json
{
  "message": "Account has been updated",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "desc": "Updated bio",
    "city": "San Francisco"
  }
}
```

---

### 4. Upload Profile Picture

**Endpoint:** `POST /api/users/:id/upload-profile`  
**Authentication:** Required (user or admin)  
**Content-Type:** `multipart/form-data`

**Headers:**
```http
Authorization: Bearer <token>
```

**Form Data:**
```
image: [File]
```

**Response (200 OK):**
```json
{
  "message": "Profile picture uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123456/social-media/profiles/abc123.jpg",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "profilePicture": "https://res.cloudinary.com/..."
  }
}
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch(`http://localhost:8800/api/users/${userId}/upload-profile`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
```

---

### 5. Upload Cover Picture

**Endpoint:** `POST /api/users/:id/upload-cover`  
**Authentication:** Required (user or admin)  
**Content-Type:** `multipart/form-data`

Same format as profile picture upload.

---

### 6. Delete User

**Endpoint:** `DELETE /api/users/:id`  
**Authentication:** Required (user or admin)

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Account has been deleted successfully"
}
```

---

## 📝 Post Management Endpoints

### 7. Create Post

**Endpoint:** `POST /api/posts`  
**Authentication:** Required

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "desc": "My first post!",
  "img": "https://res.cloudinary.com/..."
}
```

**Response (201 Created):**
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "607f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "desc": "My first post!",
    "img": "https://...",
    "likes": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 8. Upload Post Image

**Endpoint:** `POST /api/posts/upload`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Headers:**
```http
Authorization: Bearer <token>
```

**Form Data:**
```
image: [File]
```

**Response (200 OK):**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123456/social-media/posts/xyz789.jpg"
}
```

**Complete Upload Flow:**
```javascript
// Step 1: Upload image
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const uploadResponse = await fetch('http://localhost:8800/api/posts/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const { imageUrl } = await uploadResponse.json();

// Step 2: Create post with image URL
const postResponse = await fetch('http://localhost:8800/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    userId: userId,
    desc: "Check out this photo!",
    img: imageUrl
  })
});
```

---

## 🔒 Role-Based Access Control

### User Roles

1. **Regular User** (`isAdmin: false`)
   - Can create, update, delete own posts
   - Can update, delete own account
   - Can follow/unfollow users
   - Can like/unlike posts

2. **Admin** (`isAdmin: true`)
   - All regular user permissions
   - Can update/delete any user account
   - Can update/delete any post
   - Can access admin-only endpoints

---

## 🚨 Error Handling

### Authentication Errors

**401 Unauthorized - No Token:**
```json
{
  "error": "Access denied. No token provided.",
  "message": "Please login to access this resource"
}
```

**401 Unauthorized - Invalid Token Format:**
```json
{
  "error": "Access denied. Invalid token format.",
  "message": "Token format should be: Bearer <token>"
}
```

**401 Unauthorized - Expired Token:**
```json
{
  "error": "Token expired",
  "message": "Your session has expired. Please login again."
}
```

**403 Forbidden - Invalid Token:**
```json
{
  "error": "Invalid token",
  "message": "Authentication failed. Please login again."
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "error": "Access denied",
  "message": "You are not authorized to perform this action"
}
```

---

## 📋 Frontend Integration Example

### React Login Component

```javascript
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        'http://localhost:8800/api/auth/login',
        credentials
      );

      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="text" 
        placeholder="Username"
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
      />
      <input 
        type="password" 
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Axios Instance with Auth

```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8800/api'
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔧 Environment Variables

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📊 Token Details

**Token Payload:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "isAdmin": false,
  "iat": 1642252800,
  "exp": 1642857600
}
```

**Token Expiration:** 7 days (configurable via JWT_EXPIRE)

---

## ✅ Testing with Postman

### 1. Register/Login
- Send POST request to `/api/auth/login`
- Copy the `token` from response

### 2. Set Authorization
- Go to "Authorization" tab
- Type: "Bearer Token"
- Paste your token

### 3. Test Protected Routes
- All requests will now include the token automatically

---

## 🔗 Public vs Protected Routes

### Public Routes (No Auth Required)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users?userId=:id`
- `GET /api/users?username=:username`
- `GET /api/posts/:id`
- `GET /api/posts/timeline/all/:userId`
- `GET /api/posts/profile/:username`
- `GET /api/posts/search`

### Protected Routes (Auth Required)
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/users/:id/upload-profile`
- `POST /api/users/:id/upload-cover`
- `PUT /api/users/:id/follow`
- `POST /api/posts`
- `POST /api/posts/upload`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `PUT /api/posts/:id/like`

---

**🎯 Best Practices:**
1. Always validate tokens on the server
2. Use HTTPS in production
3. Store tokens securely (httpOnly cookies recommended for production)
4. Implement token refresh mechanism
5. Log out = Delete token from client storage
6. Never expose JWT_SECRET
