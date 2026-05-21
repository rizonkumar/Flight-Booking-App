function createErrorResponse() {
  return {
    success: false,
    message: "",
    data: {},
    error: {},
  };
}

module.exports = createErrorResponse;
