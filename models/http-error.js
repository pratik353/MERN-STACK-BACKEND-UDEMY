class HttpError extends Error {
    constructor(message, errorCode) {
        super(message); // Add a message property in instances
        this.code = errorCode; // add code on the base of errorcode in instances
    }
}

module.exports = HttpError;