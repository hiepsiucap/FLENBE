/** @format */

const ErrorHandler = (err, req, res, next) => {
  console.log(`this is a ${err}`);
  let CustomError = {
    msg: err.message || "Internerval Error",
    StatusCodes: err.statusCode || 500,
  };
  if (err.name === "ValidationError") {
    CustomError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    CustomError.StatusCodes = 400;
  }
  if (err.code && err.code === 11000) {
    CustomError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    CustomError.StatusCodes = 400;
  }
  if (err.name === "CastError") {
    CustomError.msg = `No item found with id : ${err.value}`;
    CustomError.StatusCodes = 404;
  }
  res.status(CustomError.StatusCodes).json({ msg: CustomError.msg });
};
module.exports = { ErrorHandler };
