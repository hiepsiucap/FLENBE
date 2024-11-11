/** @format */

const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  numsofcard: {
    type: Number,
    default: 0,
    required: true,
  },
  ava: {
    type: String,
    required: true,
  },
});
// BookSchema.methods.FindTodayAndUpdate = async () => {
//   const totalWorld=
// };
module.exports = mongoose.model("Book", BookSchema);
