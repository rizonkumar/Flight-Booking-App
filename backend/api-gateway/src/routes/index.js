const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { StatusCodes } = require("http-status-codes");

const { ServerConfig, Logger } = require("../config");
const {
  authenticate,
  authorize,
  authLimiter,
  bookingLimiter,
} = require("../middlewares");
const { ROLES, MESSAGES } = require("../utils/constants");

const router = express.Router();

const createServiceProxy = (target, pathRewrite) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers["x-user-id"]) {
          proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
        }
        if (req.headers["x-user-role"]) {
          proxyReq.setHeader("x-user-role", req.headers["x-user-role"]);
        }
      },
      error: (err, req, res) => {
        Logger.error(`Proxy error: ${err.message}`);
        if (!res.headersSent) {
          res.status(StatusCodes.BAD_GATEWAY).json({
            success: false,
            message: MESSAGES.ERROR.PROXY_ERROR,
            data: {},
            error: {
              statusCode: StatusCodes.BAD_GATEWAY,
              explanation: MESSAGES.ERROR.SERVICE_UNAVAILABLE,
            },
          });
        }
      },
    },
  });
};

const authRouter = express.Router();

const authProxy = createServiceProxy(
  ServerConfig.AUTH_SERVICE,
  (path) => `/api/v1/auth${path}`,
);

authRouter.post("/signup", authLimiter, authProxy);
authRouter.post("/signin", authLimiter, authProxy);
authRouter.post("/refresh-token", authLimiter, authProxy);
authRouter.get("/user/:id", authenticate, authProxy);

router.use("/api/v1/auth", authRouter);

const flightRouter = express.Router();

const flightServiceProxy = createServiceProxy(
  ServerConfig.FLIGHT_SERVICE,
  (path) => `/api/v1/flights${path}`,
);

flightRouter.get("/", flightServiceProxy);
flightRouter.get("/:id", flightServiceProxy);

flightRouter.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  flightServiceProxy,
);

flightRouter.patch(
  "/:id/seats",
  authenticate,
  authorize(ROLES.ADMIN),
  flightServiceProxy,
);

router.use("/api/v1/flights", flightRouter);

const airplaneRouter = express.Router();

const airplaneServiceProxy = createServiceProxy(
  ServerConfig.FLIGHT_SERVICE,
  (path) => `/api/v1/airplanes${path}`,
);

airplaneRouter.get("/", authenticate, airplaneServiceProxy);
airplaneRouter.get("/:id", authenticate, airplaneServiceProxy);

airplaneRouter.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  airplaneServiceProxy,
);

airplaneRouter.patch(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  airplaneServiceProxy,
);

airplaneRouter.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  airplaneServiceProxy,
);

router.use("/api/v1/airplanes", airplaneRouter);

const airportRouter = express.Router();

const airportServiceProxy = createServiceProxy(
  ServerConfig.FLIGHT_SERVICE,
  (path) => `/api/v1/airports${path}`,
);

airportRouter.get("/", airportServiceProxy);
airportRouter.get("/:id", airportServiceProxy);

airportRouter.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  airportServiceProxy,
);

airportRouter.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  airportServiceProxy,
);

router.use("/api/v1/airports", airportRouter);

const cityRouter = express.Router();

const cityServiceProxy = createServiceProxy(
  ServerConfig.FLIGHT_SERVICE,
  (path) => `/api/v1/cities${path}`,
);

cityRouter.get("/", cityServiceProxy);
cityRouter.get("/:id", cityServiceProxy);

cityRouter.post("/", authenticate, authorize(ROLES.ADMIN), cityServiceProxy);

cityRouter.patch(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  cityServiceProxy,
);

cityRouter.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  cityServiceProxy,
);

router.use("/api/v1/cities", cityRouter);

const bookingRouter = express.Router();

const bookingServiceProxy = createServiceProxy(
  ServerConfig.BOOKING_SERVICE,
  (path) => `/api/v1/bookings${path}`,
);

bookingRouter.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  bookingServiceProxy,
);

bookingRouter.post("/", authenticate, bookingLimiter, bookingServiceProxy);

bookingRouter.post(
  "/payment",
  authenticate,
  bookingLimiter,
  bookingServiceProxy,
);
bookingRouter.post(
  "/payments",
  authenticate,
  bookingLimiter,
  bookingServiceProxy,
);

bookingRouter.patch(
  "/:id/confirm",
  authenticate,
  authorize(ROLES.ADMIN),
  bookingServiceProxy,
);

bookingRouter.patch("/:id/cancel", authenticate, bookingServiceProxy);

bookingRouter.get("/:id/ticket", authenticate, bookingServiceProxy);

router.use("/api/v1/bookings", bookingRouter);

router.get("/api/v1/info", async (req, res) => {
  const checkService = async (name, url) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${url}/api/v1/info`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return {
        name,
        status: response.ok ? "healthy" : "unhealthy",
        statusCode: response.status,
      };
    } catch (error) {
      return { name, status: "unreachable", error: error.message };
    }
  };

  const services = await Promise.all([
    checkService("Flight-Service", ServerConfig.FLIGHT_SERVICE),
    checkService("Booking-Service", ServerConfig.BOOKING_SERVICE),
    checkService("Auth-Service", ServerConfig.AUTH_SERVICE),
  ]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: MESSAGES.SUCCESS.HEALTH_CHECK,
    data: {
      gateway: {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      services,
    },
    error: {},
  });
});

module.exports = router;
