# API Gateway — Flight Booking System

The **API Gateway** is the single entry point for the Flight Booking System. All client requests flow through this gateway, which handles **authentication**, **authorization**, **rate limiting**, and **reverse proxying** to the appropriate backend microservice.

## Architecture

```
Client → API Gateway (:8080) → Flight-Service (:4000)
                              → Booking-Service (:4001)
                              → Auth-Service (:5001)
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (already included — edit .env if needed)
# API_GATEWAY_PORT=8080
# FLIGHT_SERVICE=http://localhost:4000
# BOOKING_SERVICE=http://localhost:4001
# AUTH_SERVICE=http://localhost:5001
# JWT_SECRET=flight_booking_jwt_secret_key_2024

# 3. Start in development mode
npm run dev
```

## API Routes

### Health Check

| Method | Route            | Auth | Role | Description               |
|--------|------------------|------|------|---------------------------|
| GET    | `/api/v1/info`   | ✗    | —    | Gateway & service health  |

### Auth Routes (proxied to Auth-Service)

> Rate limited: **10 requests / minute**

| Method | Gateway Route                    | Upstream Route              | Auth | Role |
|--------|----------------------------------|-----------------------------|------|------|
| POST   | `/api/v1/auth/signup`            | `/api/v1/auth/signup`            | ✗    | —    |
| POST   | `/api/v1/auth/signin`            | `/api/v1/auth/signin`            | ✗    | —    |
| POST   | `/api/v1/auth/refresh-token`     | `/api/v1/auth/refresh-token`     | ✗    | —    |

### Flight Routes (proxied to Flight-Service)

| Method | Route                          | Auth | Role  |
|--------|--------------------------------|------|-------|
| GET    | `/api/v1/flights`              | ✓    | Any   |
| GET    | `/api/v1/flights/:id`          | ✓    | Any   |
| POST   | `/api/v1/flights`              | ✓    | ADMIN |
| PATCH  | `/api/v1/flights/:id/seats`    | ✓    | ADMIN |

### Airplane Routes (proxied to Flight-Service)

| Method | Route                          | Auth | Role  |
|--------|--------------------------------|------|-------|
| GET    | `/api/v1/airplanes`            | ✓    | Any   |
| GET    | `/api/v1/airplanes/:id`        | ✓    | Any   |
| POST   | `/api/v1/airplanes`            | ✓    | ADMIN |
| PATCH  | `/api/v1/airplanes/:id`        | ✓    | ADMIN |
| DELETE | `/api/v1/airplanes/:id`        | ✓    | ADMIN |

### Airport Routes (proxied to Flight-Service)

| Method | Route                          | Auth | Role  |
|--------|--------------------------------|------|-------|
| GET    | `/api/v1/airports`             | ✓    | Any   |
| GET    | `/api/v1/airports/:id`         | ✓    | Any   |
| POST   | `/api/v1/airports`             | ✓    | ADMIN |
| DELETE | `/api/v1/airports/:id`         | ✓    | ADMIN |

### City Routes (proxied to Flight-Service)

| Method | Route                          | Auth | Role  |
|--------|--------------------------------|------|-------|
| GET    | `/api/v1/cities`               | ✓    | Any   |
| GET    | `/api/v1/cities/:id`           | ✓    | Any   |
| POST   | `/api/v1/cities`               | ✓    | ADMIN |
| PATCH  | `/api/v1/cities/:id`           | ✓    | ADMIN |
| DELETE | `/api/v1/cities/:id`           | ✓    | ADMIN |

### Booking Routes (proxied to Booking-Service)

> Rate limited: **20 requests / minute**

| Method | Route                          | Auth | Role |
|--------|--------------------------------|------|------|
| POST   | `/api/v1/bookings`             | ✓    | Any  |
| POST   | `/api/v1/bookings/payment`     | ✓    | Any  |

## Rate Limiting

| Limiter          | Max Requests | Window   | Applied To                |
|------------------|-------------|----------|---------------------------|
| General Limiter  | 100         | 1 minute | All routes (global)       |
| Booking Limiter  | 20          | 1 minute | Booking routes            |
| Auth Limiter     | 10          | 1 minute | Auth routes (brute force) |

## Project Structure

```
src/
├── config/
│   ├── index.js
│   ├── logger-config.js
│   └── server-config.js
├── middlewares/
│   ├── index.js
│   ├── auth-middleware.js
│   └── rate-limiter.js
├── routes/
│   └── index.js
├── utils/
│   ├── constants.js
│   └── errors/
│       └── app-error.js
└── index.js
```
