
# Flight Booking Service

A microservice for handling flight bookings built with Node.js, Express, and MySQL.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flight-booking-service.git
   cd flight-booking-service
   ```


2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with:
   ```env
   PORT=<your_port_number>
   FLIGHT_SERVICE=<flight_service_base_url>
   ```

## Database Setup

1. Sequlize init inside src folder

   ```bash
   npx sequelize init --force
   ```
   **Note**: Inside src/config/congif.json file should be present which contains username, password etc.

1. Create the database using Sequelize:

   ```bash
   npx sequelize-cli db:create
   ```


2. Run migrations:

   ```bash
   npx sequelize-cli db:migrate
   ```

3. (Optional) Undo migrations:
   ```bash
   npx sequelize-cli db:migrate:undo
   ```

## API Endpoints

### Health Check

```http
GET /api/v1/info
```

**Response:**

```json
{
  "success": true,
  "message": "API is live",
  "error": {},
  "data": {}
}
```

### Create Booking

```http
POST /api/v1/bookings
```

**Request Body:**

```json
{
  "flightId": "integer",
  "userId": "integer",
  "noofSeats": "integer"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "error": {},
  "data": {
    "bookingDetails": {}
  }
}
```

**Error Response (4xx/5xx):**

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "explanation": "Detailed error message"
  },
  "data": {}
}
```

Common error scenarios:

- Insufficient seats available
- Invalid flight ID
- Internal server error

## Development

Start the development server:

```bash
npm run dev
```

The server will start on the configured port with nodemon for auto-reloading.

## Database Config

Database configuration in `config/config.json` supports:

- Development
- Test
- Production

Each environment can have its own database settings.

```

```
