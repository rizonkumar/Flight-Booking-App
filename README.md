# SkyRoute Flight Booking App - Microservice Architecture

A premium, state-of-the-art microservices-based flight search, booking, payment, and ticketing platform. Engineered for solution-architect level scalability, the application utilizes separate, focused microservices, unified API routing, robust transaction-safe operations, and asynchronous background jobs.

---

## 🏗️ System Architecture

```mermaid
graph TD
  subgraph Client Layer
    frontend["React 19 / Next.js 16 Client (Port 3000)"]
  end

  subgraph API Gateway Layer
    gateway["API Gateway (Port 6000)"]
  end

  subgraph Microservice Layer
    authService["Auth Service (Port 5000)"]
    flightService["Flight Service (Port 3000)"]
    bookingService["Booking Service (Port 4000)"]
    notifService["Notification Service (Port 7000)"]
  end

  subgraph Queue & Background Schedulers
    redisQueue["Redis Queue (Bull) 'email-queue'"]
    cronJob["Booking Expiry Cron"]
  end

  subgraph Database Layer
    authDb[("auth_db_dev (PostgreSQL)")]
    flightDb[("flights_db (PostgreSQL)")]
    bookingDb[("flights_booking_db (PostgreSQL)")]
  end

  frontend -->|"REST API Requests"| gateway
  gateway -->|"Auth API Proxy"| authService
  gateway -->|"Flight API Proxy"| flightService
  gateway -->|"Booking API Proxy"| bookingService

  bookingService -->|"Check Seats / Lock Seats"| flightService
  bookingService -->|"Token Validation"| authService

  bookingService -->|"Enqueue Email Tasks"| redisQueue
  bookingService -.->|"Triggers seat release"| cronJob
  cronJob -->|"Patch flight seats"| flightService

  redisQueue -->|"Consume Tasks"| notifService
  notifService -->|"Dynamic PDF & QR Ticket Gen"| notifService

  authService --> authDb
  flightService --> flightDb
  bookingService --> bookingDb
```

---

## ⚡ Tech Stack & Architecture Highlights

1. **API Gateway (Port 6000)**: Single entry point. Features Express Rate Limiting (prevent brute force & booking spam), CORS, Helmet security headers, Morgan logging, and JWT authentication token injection before proxying downstream.
2. **Auth Service (Port 5000)**: Zod input validation, Bcrypt password hashing, access and refresh token signing, and secure role-based authorization management.
3. **Flight Service (Port 3000)**: Serves world cities, airports, airplane capacity configurations, and flight routes.
4. **Booking Service (Port 4000)**: Transaction-bound reservation logic, time-based cancellation & refund calculations (100% / 50% / 0% based on flight departure hours), and background cron jobs reclaiming seats for unpaid or stale reservations.
5. **Notification Service (Port 7000)**: Redis and Bull-powered asynchronous message queue that consumes ticketing notifications, auto-generates dynamic PDF tickets with scannable QR codes using PDFKit, and transmits them using SMTP Nodemailer.
6. **Frontend (Port 3000)**: Next.js 16 + React 19 web interface utilizing Tailwind-free sleek forest-green and mint CSS styles, fully responsive layout transitions, premium interaction models, and robust dynamic forms.

---

## 🚀 Step-by-Step Local Setup Guide

### 📋 Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher) & **npm**
- **PostgreSQL** (running locally on port `5432` with standard user `postgres`)
- **Redis Server** (running locally on port `6379`)

---

### 🗄️ 1. Database Initialization
Open PGAdmin or PostgreSQL CLI and create three empty databases:
1. `flights_db`
2. `flights_booking_db`
3. `auth_db_dev`

---

### 📁 2. Microservices Configuration (.env)

Each folder requires a configured `.env` file containing database connections and service credentials.

#### Flight Service Configuration
Create `backend/flight-service/.env`:
```env
PORT=3000
DB_URI=postgres://postgres:Rahi%40%23pass5@127.0.0.1:5432/flights_db
```

#### Booking Service Configuration
Create `backend/booking-service/.env`:
```env
PORT=4000
DB_URI=postgres://postgres:Rahi%40%23pass5@127.0.0.1:5432/flights_booking_db
FLIGHT_SERVICE=http://localhost:3000
AUTH_SERVICE=http://localhost:5000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### Auth Service Configuration
Create `backend/auth-service/.env`:
```env
PORT=5000
JWT_SECRET=flight_booking_jwt_secret_key_2024
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
DB_URI=postgres://postgres:Rahi%40%23pass5@127.0.0.1:5432/auth_db_dev
```

#### Notification Service Configuration
Create `backend/notification-service/.env`:
```env
PORT=7000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### API Gateway Configuration
Create `backend/api-gateway/.env`:
```env
PORT=6000
FLIGHT_SERVICE=http://localhost:3000
BOOKING_SERVICE=http://localhost:4000
AUTH_SERVICE=http://localhost:5000
JWT_SECRET=flight_booking_jwt_secret_key_2024
```

#### Frontend Configuration
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:6000
```

---

### 🛠️ 3. Database Migration & World Seeder

Now, let's build the tables and populate **1000+ flights, 100+ cities, and 150+ airports** globally.

1. **Run Auth Migrations**:
   ```bash
   cd backend/auth-service
   export $(cat .env | xargs) && npx sequelize-cli db:migrate
   ```

2. **Run Booking Migrations**:
   ```bash
   cd backend/booking-service
   export $(cat .env | xargs) && npx sequelize-cli db:migrate
   ```

3. **Run Flight Migrations & Execute Seeder**:
   ```bash
   cd backend/flight-service
   export $(cat .env | xargs) && npx sequelize-cli db:migrate
   export $(cat .env | xargs) && npm run seed
   ```

---

### 🟢 4. Starting the Services

Start each service in a new terminal window or tab.

1. **Start Redis Server** (if not already running):
   ```bash
   redis-server
   ```

2. **Start Auth Service**:
   ```bash
   cd backend/auth-service
   npm run dev
   ```

3. **Start Flight Service**:
   ```bash
   cd backend/flight-service
   npm run dev
   ```

4. **Start Booking Service**:
   ```bash
   cd backend/booking-service
   npm run dev
   ```

5. **Start Notification Service**:
   ```bash
   cd backend/notification-service
   npm run dev
   ```

6. **Start API Gateway**:
   ```bash
   cd backend/api-gateway
   npm run dev
   ```

---

### 💻 5. Running the Client Frontend

Once the API Gateway and backend services are operational, spin up the React 19 Next.js user interface:

```bash
cd frontend
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`** to browse flights, authenticate, reserve seats, make mock payments, manage your bookings, check refund schedules, and download ticketing PDFs.
