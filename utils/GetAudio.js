/** @format */

// Imports the AWS SDK for Polly
// Configuration is loaded from environment variables
const {
  PollyClient,
  SynthesizeSpeechCommand,
} = require("@aws-sdk/client-polly");
const fs = require("fs");
require("dotenv").config();
const util = require("util");
const path = require("path");

const client = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
async function GetAudio(text, filename) {
  // The text to synthesize using AWS Polly
  const params = {
    Text: text,
    OutputFormat: process.env.AWS_POLLY_OUTPUT_FORMAT || "mp3",
    VoiceId: process.env.AWS_POLLY_VOICE_ID || "Joanna",
    Engine: process.env.AWS_POLLY_ENGINE || "standard",
  };

  const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const audioFilename = `${sanitizedFilename}_${Date.now()}.mp3`;

  // Create the command for AWS Polly
  const command = new SynthesizeSpeechCommand(params);

  // Performs the text-to-speech request
  const response = await client.send(command);

  const publicPath = path.join(__dirname, "..", "public", "audio");
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  const audioPath = path.join(publicPath, audioFilename);

  // Convert the response stream to buffer and write to file
  const chunks = [];
  for await (const chunk of response.AudioStream) {
    chunks.push(chunk);
  }
  const audioBuffer = Buffer.concat(chunks);

  const writeFile = util.promisify(fs.writeFile);
  await writeFile(audioPath, audioBuffer);
  setTimeout(async () => {
    try {
      await fs.promises.unlink(audioPath);
      console.log(`Deleted file: ${audioPath}`);
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
    }
  }, 10000);
  console.log("Audio content written to file: output.mp3");
  return audioPath;
}
module.exports = GetAudio;
