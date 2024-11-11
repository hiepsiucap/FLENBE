/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
function validators(email) {
  var exp = /^([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})$/;
  if (email.match(exp)) return true;
  return false;
}
const UserSchema = new Schema({
  name: {
    type: String,
    require: [true, "please provide your name"],
    maxlength: 30,
    minlenth: 3,
  },
  ava: {
    type: String,
    require: [true, "Vui lòng cung cấp ảnh đại diện "],
    default:
      "https://res.cloudinary.com/dhhuv7n0h/image/upload/v1703303755/UserAvatar/avatar-default-icon_xigwu7.png",
  },
  role: {
    type: String,
    default: "student",
    enum: ["student", "staff"],
    require: [true, "Vui lòng cung cấp vị trí của bạn"],
  },
  birth: {
    type: Date,
    maxlength: 30,
    default: Date.now,
  },
  email: {
    type: String,
    require: [true, "Vui lòng cung cấp email"],
    maxlength: 30,
    minlenth: 6,
    validate: {
      validator: validators,
      message: "Kiểm tra lại Email của bạn",
    },
  },
  totalscore: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    require: [true, "Vui lòng cung cấp mk"],
  },
  verficationToken: {
    type: String,
  },
  level_description: {
    type: String,
    default: "Newbie",
  },
  scoreADay: {
    type: Number,
    default: 3000,
  },
  IsVerification: {
    type: Boolean,
    default: false,
  },
});
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  saltRound = 10;
  salt = await bcrypt.genSalt(saltRound);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.method("compare", async function name(password) {
  const check = await bcrypt.compare(password, this.password);
  return check;
});
module.exports = mongoose.model("User", UserSchema);
