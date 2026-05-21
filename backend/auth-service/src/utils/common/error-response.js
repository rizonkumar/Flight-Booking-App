function ErrorResponse() {
    return {
        success: false,
        message: '',
        data: {},
        error: {},
    };
}

module.exports = ErrorResponse;
