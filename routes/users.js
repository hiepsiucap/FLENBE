/** @format */

var express = require("express");
var router = express.Router();
const { GetAllUser, GetTopYear } = require("../Controller/UserController");
const { authentication } = require("../Middleware/authentication");
/* GET users listing. */
router.get("/all", authentication, GetAllUser);
router.get("/top", authentication, GetTopYear);
module.exports = router;
