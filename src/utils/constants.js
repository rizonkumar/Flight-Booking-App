const MESSAGES = {
  SUCCESS: {
    DEFAULT: "Operation completed successfully",
    AIRPLANE_CREATED: "Airplane created successfully",
    API_LIVE: "API is live and operational",
    AIRPLANE_FETCHED: "Airplane fetched successfully",
    DELETE_AIRPLANE_SUCCESS: "Airplane deleted successfully",
    UPDATE_AIRPLANE_SUCCESS: "Airplane updated successfully",
    CITY_CREATED: "City created successfully",
    CITIES_FETCHED: "Cities fetched successfully",
    UPDATE_CITY_SUCCESS: "City updated successfully",
    DELETE_CITY_SUCCESS: "City deleted successfully",
    AIRPORT_CREATED: "Airport created successfully",
    AIRPORT_FETCHED: "Airports fetched successfully",
    DELETE_AIRPORT_SUCCESS: "Airport deleted successfully",
    FLIGHT_CREATED: "Successfully created flight",
  },
  ERROR: {
    DEFAULT: "An unexpected error occurred",
    AIRPLANE_CREATE_FAILED: "Failed to create airplane",
    INVALID_INPUT: "Invalid input provided",
    MODEL_NUMBER_REQUIRED: "Model number is required",
    RESOURCE_NOT_FOUND: "Requested resource not found",
    DATABASE_ERROR: "Database operation failed",
    VALIDATION_ERROR: "Validation error occurred",
    UNABLE_TO_FETCH_ALL_AIRPLANES: "Cannot fetch data of all the airplanes",
    UNABLE_TO_FETCH_AIRPLANE: "Cannot fetch data of the airplane",
    AIRPLANE_NOT_FOUND: "Airplane not found",
    DELETE_AIRPLANE_FAILED: "Failed to delete airplane",
    UPDATE_AIRPLANE_FAILED: "Failed to update airplane",
    INVALID_CAPACITY: "Invalid airplane capacity",
    CAPACITY_EXCEEDED: "Airplane capacity exceeds maximum limit",
    UNABLE_TO_UPDATE_AIRPLANE: "Unable to update airplane",
    NOT_FOUND: "Requested resource not found",
    CANNOT_CREATE_CITY: "Cannot create city",
    CITY_NAME_REQUIRED: "City name is required",
    UNABLE_TO_FETCH_ALL_CITIES: "Cannot fetch data of all the cities",
    CITY_NOT_FOUND: "City not found",
    UNABLE_TO_UPDATE_CITY: "Unable to update city",
    UNABLE_TO_DELETE_CITY: "Unable to delete city",
    UPDATE_CITY_FAILED: "Failed to update city",
    DELETE_CITY_FAILED: "Failed to delete city",
    CITY_NAME_ALREADY_EXISTS: "City name already exists",
    AIRPORT_CREATE_FAILED: "Failed to create airport",
    UNABLE_TO_FETCH_ALL_AIRPORTS: "Cannot fetch data of all the airports",
    AIRPORT_NOT_FOUND: "Airport not found",
    UNABLE_TO_FETCH_AIRPORT: "Cannot fetch data of the airport",
    DELETE_AIRPORT_FAILED: "Failed to delete airplane",
    NAME_REQUIRED: "Name is required",
    CITYID_REQUIRED: "City ID is required",
    AIRPORT_CODE_REQUIRED: "Airport code is required",
    CANNOT_CREATE_FLIGHT: "Cannot create flight",
  },
  INFO: {
    REQUEST_RECEIVED: "Request received and being processed",
  },
};

const CONFIG = {
  MAX_AIRPLANE_CAPACITY: 1000,
};

module.exports = {
  MESSAGES,
  CONFIG,
};
