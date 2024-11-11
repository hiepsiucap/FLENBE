/** @format */

const mongoose = require("mongoose");
const connectMongoDB = (url) => {
  return mongoose.connect(url);
};
module.exports = connectMongoDB;
