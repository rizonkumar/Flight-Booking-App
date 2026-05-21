# Auth-Service

Authentication microservice for the Flight Booking System. Handles user registration, login, JWT token management, and role-based authorization.

## System Architecture

| Service         | Port |
| --------------- | ---- |
| Flight-Service  | 3000 |
| Booking-Service | 4000 |
| **Auth-Service**| 5000 |

## Tech Stack

- **Runtime:** Node.js + Express
- **ORM:** Sequelize (MySQL)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod
- **Logging:** Winston

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create the database
npx sequelize-cli db:create --config src/config/config.json

# 3. Run migrations
npm run db:migrate

# 4. Start the server (development)
npm run dev

# 5. Start the server (production)
npm start
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
JWT_SECRET=flight_booking_jwt_secret_key_2024
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Health Check

```
GET /api/v1/info
```

**Response (200):**
```json
{
  "success": true,
  "message": "Auth API is live",
  "data": {},
  "error": {}
}
```

### Sign Up

```
POST /api/v1/auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  },
  "error": {}
}
```

### Sign In

```
POST /api/v1/auth/signin
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User signed in successfully",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "error": {}
}
```

### Refresh Token

```
POST /api/v1/auth/refresh-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "error": {}
}
```

## Project Structure

```
src/
├── config/
│   ├── config.json          # Sequelize DB config
│   ├── index.js             # Barrel export
│   ├── logger-config.js     # Winston logger
│   └── server-config.js     # Environment config
├── controllers/
│   ├── auth-controller.js   # Auth request handlers
│   ├── index.js             # Barrel export
│   └── info-controller.js   # Health check
├── middlewares/
│   ├── auth-middleware.js    # JWT auth & role-based authorization
│   ├── index.js             # Barrel export
│   └── validation-middleware.js # Zod request validation
├── migrations/
│   └── 20241026010000-create-user.js
├── models/
│   ├── index.js             # Sequelize model loader
│   └── user.js              # User model
├── repositories/
│   ├── crud-repository.js   # Base CRUD operations
│   ├── index.js             # Barrel export
│   └── user-repository.js   # User data access
├── routes/
│   ├── index.js             # API router
│   └── v1/
│       ├── auth-routes.js   # Auth endpoints
│       └── index.js         # V1 router
├── services/
│   ├── auth-service.js      # Auth business logic
│   └── index.js             # Barrel export
├── utils/
│   ├── common/
│   │   ├── enums.js         # Role enums
│   │   ├── error-response.js
│   │   ├── index.js         # Barrel export
│   │   └── success-response.js
│   ├── constants.js         # Message constants
│   ├── errors/
│   │   └── app-error.js     # Custom error class
│   ├── helpers/
│   │   └── jwt-helper.js    # JWT utilities
│   └── index.js             # Barrel export
└── index.js                 # Entry point
```

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

### Middleware Usage

```javascript
const { AuthMiddleware } = require('./middlewares');

// Protect a route (any authenticated user)
router.get('/profile', AuthMiddleware.authenticate, controller.getProfile);

// Protect a route (admin only)
router.delete('/users/:id', AuthMiddleware.authenticate, AuthMiddleware.authorize('admin'), controller.deleteUser);
```
