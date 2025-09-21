/** @format */

const OpenAI = require("openai");
const { StatusCodes } = require("http-status-codes");
const config = require("../config/chatgpt-config");
const CustomAPIError = require("../errors/Custom-API");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Translate and get word definitions using ChatGPT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGPTTranslation = async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new CustomAPIError(
        "Text is required and must be a non-empty string",
        StatusCodes.BAD_REQUEST
      );
    }

    if (text.length > 500) {
      throw new CustomAPIError(
        "Text is too long. Maximum length is 500 characters",
        StatusCodes.BAD_REQUEST
      );
    }

    // Create the prompt for ChatGPT
    const prompt = `
Analyze the following text and provide 4-5 key words/phrases with their Vietnamese translations and English definitions. 
Return the response as a valid JSON array with objects containing exactly these fields:
- meaning: Vietnamese translation
- type: word type (noun, verb, adjective, etc.)
- definition: detailed definition in English

Text to analyze: "${text.trim()}"

Please respond with only the JSON array, no additional text or formatting.
`;

    // Call ChatGPT API
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful language translator and dictionary. Always respond with valid JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new CustomAPIError(
        "No response received from ChatGPT",
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response:", responseText);
      throw new CustomAPIError(
        "Invalid response format from ChatGPT",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    // Validate response structure
    if (!Array.isArray(parsedResponse)) {
      throw new CustomAPIError(
        "Response should be an array",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    // Validate each item in the array
    const validatedResponse = parsedResponse
      .filter((item) => {
        return (
          item &&
          typeof item === "object" &&
          typeof item.meaning === "string" &&
          typeof item.type === "string" &&
          typeof item.definition === "string"
        );
      })
      .slice(0, 5); // Limit to maximum 5 items

    if (validatedResponse.length === 0) {
      throw new CustomAPIError(
        "No valid translations found in response",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    // Return successful response
    res.status(StatusCodes.OK).json({
      success: true,
      data: validatedResponse,
      message: "Translation completed successfully",
      originalText: text.trim(),
    });
  } catch (error) {
    console.error("ChatGPT translation error:", error);

    // Handle OpenAI specific errors
    if (error.code === "insufficient_quota") {
      throw new CustomAPIError(
        "OpenAI API quota exceeded",
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    if (error.code === "invalid_api_key") {
      throw new CustomAPIError(
        "Invalid OpenAI API key",
        StatusCodes.UNAUTHORIZED
      );
    }

    if (error.code === "rate_limit_exceeded") {
      throw new CustomAPIError(
        "Rate limit exceeded. Please try again later",
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    // Handle custom API errors
    if (error instanceof CustomAPIError) {
      throw error;
    }

    // Handle OpenAI API errors
    if (error.response?.status) {
      throw new CustomAPIError(
        `OpenAI API error: ${error.message}`,
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
  getGPTTranslation,
};
