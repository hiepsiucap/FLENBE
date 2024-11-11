/** @format */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
var indexRouter = require("./routes/index");
require("dotenv").config();
var usersRouter = require("./routes/users");
var AuthRouter = require("./routes/auth");
var SessionRouter = require("./routes/session");
const cors = require("cors");
var FlashCardRouter = require("./routes/flashcard");
var BookRouter = require("./routes/bookstore");
const { ErrorHandler } = require("./Middleware/ErrorHandler");
const NotFound = require("./Middleware/Notfound");
var app = express();
console.log(process.env.FRONT_END_API);
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-refresh-token"],
  exposedHeaders: ["X-refresh-token", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser(process.env.JWT_SECRET_KEY));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/flashcard", FlashCardRouter);
app.use("/api/bookstore", BookRouter);
app.use("/api/session", SessionRouter);
app.use(NotFound);
app.use(ErrorHandler);
module.exports = app;
