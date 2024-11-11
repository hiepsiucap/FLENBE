/** @format */
const mongoose = require("mongoose");
const TokenSchema = new mongoose.Schema(
  {
    refereshToken: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    isValid: { type: String, default: true },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Token", TokenSchema);
