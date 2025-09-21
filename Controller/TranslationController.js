/** @format */

const {
  TranslateClient,
  TranslateTextCommand,
} = require("@aws-sdk/client-translate");
const { StatusCodes } = require("http-status-codes");
const config = require("../config/aws-translate-config");
const CustomAPIError = require("../errors/Custom-API");

// Initialize AWS Translate client
const translateClient = new TranslateClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

/**
 * Translate text to Vietnamese
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const translateToVietnamese = async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new CustomAPIError(
        "Text is required and must be a non-empty string",
        StatusCodes.BAD_REQUEST
      );
    }

    // Check text length (AWS Translate has a limit of 5000 bytes)
    if (text.length > 5000) {
      throw new CustomAPIError(
        "Text is too long. Maximum length is 5000 characters",
        StatusCodes.BAD_REQUEST
      );
    }

    // Prepare translation parameters
    const translateParams = {
      Text: text.trim(),
      SourceLanguageCode: config.translate.sourceLanguageCode,
      TargetLanguageCode: config.translate.targetLanguageCode,
    };

    // Create translate command
    const command = new TranslateTextCommand(translateParams);

    // Execute translation
    const result = await translateClient.send(command);

    // Return successful response
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        originalText: text.trim(),
        translatedText: result.TranslatedText,
        sourceLanguage: result.SourceLanguageCode,
        targetLanguage: result.TargetLanguageCode,
      },
      message: "Text translated successfully",
    });
  } catch (error) {
    console.error("Translation error:", error);

    // Handle AWS specific errors
    if (error.name === "UnsupportedLanguagePairException") {
      throw new CustomAPIError(
        "Unsupported language pair for translation",
        StatusCodes.BAD_REQUEST
      );
    }

    if (error.name === "TextSizeLimitExceededException") {
      throw new CustomAPIError(
        "Text size exceeds the limit",
        StatusCodes.BAD_REQUEST
      );
    }

    if (error.name === "InvalidRequestException") {
      throw new CustomAPIError(
        "Invalid translation request",
        StatusCodes.BAD_REQUEST
      );
    }

    // Handle custom API errors
    if (error instanceof CustomAPIError) {
      throw error;
    }

    // Handle other AWS errors
    if (error.$metadata) {
      throw new CustomAPIError(
        `AWS Translate service error: ${error.message}`,
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    // Handle unexpected errors
    throw new CustomAPIError(
      "An unexpected error occurred during translation",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  translateToVietnamese,
};
