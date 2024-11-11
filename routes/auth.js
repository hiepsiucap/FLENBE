/** @format */

var express = require("express");
var router = express.Router();
const {
  Login,
  Register,
  Logout,
  VerifyEmail,
  ForgotPassWord,
  ResetPassword,
  CheckAuthenticate,
} = require("../Controller/AuthController");
const { authentication } = require("../Middleware/authentication");
/* GET users listing. */
router.post("/login", Login);
router.post("/register", Register);
router.post("/forgotpassword", ForgotPassWord);
router.post("/resetpassword", ResetPassword);
router.post("/validate", authentication, CheckAuthenticate);
router.post("/logout", authentication, Logout);
router.post("/verifyemail", VerifyEmail);
module.exports = router;
