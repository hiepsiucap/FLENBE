/** @format */

var express = require("express");
var router = express.Router();
const {
  CreateFlashCard,
  GetAllFlashCard,
  DeleteFlashCard,
  ReadFlashCard,
  GetFlashCardToday,
  CheckSave,
} = require("../Controller/FlashCardController");
const { authentication } = require("../Middleware/authentication");
const fileUpLoader = require("../config/cloudinary-config");
/* GET users listing. */
router.post("/create", authentication, CreateFlashCard);
router.get("/bookcard/:bookid", authentication, GetAllFlashCard);
router.get("/read/:id", authentication, ReadFlashCard);
router.get("/getreview", authentication, GetFlashCardToday);
router.post("/checksave", authentication, CheckSave);
router.delete("/:flashcardid", authentication, DeleteFlashCard);
module.exports = router;
