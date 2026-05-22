"use strict";

const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const baseConfig = {
  use_env_variable: "FLIGHT_DATABASE_URL",
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig,
};
