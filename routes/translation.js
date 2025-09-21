/** @format */

const express = require("express");
const router = express.Router();
const {
  translateToVietnamese,
} = require("../Controller/TranslationController");

/**
 * POST /api/translation/translate
 * Translate text to Vietnamese
 * Body: { text: "hello" }
 */
router.post("/translate", translateToVietnamese);

module.exports = router;
