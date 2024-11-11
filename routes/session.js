/** @format */

var express = require("express");
var router = express.Router();
const {
  CreateASesionController,
  GetScoreToday,
  UpdateASessionController,
} = require("../Controller/SessionController");
const { authentication } = require("../Middleware/authentication");
router.post("/create", authentication, CreateASesionController);
router.get("/totalscore", authentication, GetScoreToday);
router.patch("/updatescore", authentication, UpdateASessionController);
module.exports = router;
