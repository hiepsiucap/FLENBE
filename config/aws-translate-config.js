/** @format */

require("dotenv").config();

// Load configuration from environment variables
const config = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
  },
  translate: {
    sourceLanguageCode: "auto", // Auto-detect source language
    targetLanguageCode: "vi", // Vietnamese
  },
};

// Validate required AWS configuration
if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
  console.error("Error: AWS credentials missing in environment variables");
  console.error(
    "Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file"
  );
  process.exit(1);
}

module.exports = config;
