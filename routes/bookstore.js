/** @format */

var express = require("express");
var router = express.Router();
const { CreateBook, GetBookByUser } = require("../Controller/BookController");
const { authentication } = require("../Middleware/authentication");
const fileUpLoader = require("@/config/cloudinary-config");
/* GET users listing. */
router.post("/create", authentication, fileUpLoader.single("file"), CreateBook);
router.get("/all", authentication, GetBookByUser);
module.exports = router;
