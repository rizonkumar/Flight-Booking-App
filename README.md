# Flight Booking App

Microservice-based flight booking application with a Next.js frontend, an Express API gateway, and separate backend services for auth, flights, bookings, and notifications.

## Local Development

Start all backend services from the backend root:

```bash
cd backend
npm run dev:fresh
```

Start the frontend separately:

```bash
cd frontend
npm run dev
```

Local service URLs:

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| API Gateway | `http://localhost:8080` |
| Flight Service | `http://localhost:4000` |
| Booking Service | `http://localhost:4001` |
| Auth Service | `http://localhost:5001` |
| Notification Service | `http://localhost:7001` |

Use `http://localhost:8080` for frontend API calls. Chrome blocks port `6000` as unsafe, so do not use it for browser-facing APIs.

## Backend Architecture

```mermaid
flowchart LR
  browser["Browser / Next.js Frontend<br/>localhost:3000"]
  gateway["API Gateway<br/>Express<br/>localhost:8080"]

  auth["Auth Service<br/>Express + Sequelize<br/>localhost:5001"]
  flight["Flight Service<br/>Express + Sequelize<br/>localhost:4000"]
  booking["Booking Service<br/>Express + Sequelize<br/>localhost:4001"]
  notification["Notification Service<br/>Express + Bull Worker<br/>localhost:7001"]

  authDb[("Aiven MySQL<br/>auth_db")]
  flightDb[("Aiven MySQL<br/>flights_db")]
  bookingDb[("Aiven MySQL<br/>flights_booking_db")]
  redis[("Redis<br/>email-queue")]
  smtp["SMTP / Email Provider"]

  browser -->|"HTTP API<br/>/api/v1/*"| gateway

  gateway -->|"/api/v1/auth/*"| auth
  gateway -->|"/api/v1/flights<br/>/api/v1/airplanes<br/>/api/v1/airports<br/>/api/v1/cities"| flight
  gateway -->|"/api/v1/bookings/*"| booking

  auth --> authDb
  flight --> flightDb
  booking --> bookingDb

  booking -->|"flight lookup / seat updates"| flight
  booking -->|"user lookup"| auth
  booking -->|"enqueue email jobs"| redis
  notification -->|"consume email jobs"| redis
  notification --> smtp
```

## Environment

Backend services share one local env file:

```text
backend/.env
```

Frontend uses:

```text
frontend/.env.local
```

See `.env.example` for the expected variables.
