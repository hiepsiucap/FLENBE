/** @format */

require("dotenv").config();

// Load configuration from environment variables
const config = {
  openai: {
    apiKey: process.env.GPT_KEY,
    model: "gpt-3.5-turbo",
    maxTokens: 1000,
    temperature: 0.3,
  },
};

// Validate required OpenAI configuration
if (!config.openai.apiKey) {
  console.error("Error: OpenAI API key missing in environment variables");
  console.error("Please set GPT_KEY in your .env file");
  process.exit(1);
}

module.exports = config;
