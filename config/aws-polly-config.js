/** @format */

require("dotenv").config();

// Load configuration from environment variables
const config = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
  },
  polly: {
    voiceId: process.env.AWS_POLLY_VOICE_ID || "Joanna",
    engine: process.env.AWS_POLLY_ENGINE || "standard",
    outputFormat: process.env.AWS_POLLY_OUTPUT_FORMAT || "mp3",
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
