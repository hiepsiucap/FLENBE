/** @format */

const CustomAPIError = require("./Custom-API");
const { StatusCodes } = require("http-status-codes");
class AuthorizeError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.StatusCodes = StatusCodes.FORBIDDEN;
  }
}
module.exports = AuthorizeError;
