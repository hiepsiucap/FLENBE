/** @format */

const express = require("express");
const router = express.Router();
const {
  translateToVietnamese,
} = require("../Controller/TranslationController");
const { getGPTTranslation } = require("../Controller/ChatGPTController");

/**
 * POST /api/translation/translate
 * Translate text to Vietnamese using AWS Translate
 * Body: { text: "hello" }
 */
router.post("/translate", translateToVietnamese);

/**
 * POST /api/translation/getgpt
 * Get word definitions and translations using ChatGPT
 * Body: { text: "hello" }
 * Returns: Array of { meaning: string (Vietnamese), type: string, definition: string (English) }
 */
router.post("/getgpt", getGPTTranslation);

module.exports = router;
