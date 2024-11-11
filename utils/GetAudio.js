/** @format */

// Imports the Google Cloud client library
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
require("dotenv").config();
const util = require("util");
const path = require("path");
const client = new textToSpeech.TextToSpeechClient({
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});
async function GetAudio(text, filename) {
  // The text to synthesize
  const request = {
    input: { text: text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    // select the type of audio encoding
    audioConfig: { audioEncoding: "MP3" },
  };
  const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const audioFilename = `${sanitizedFilename}_${Date.now()}.mp3`;
  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  const publicPath = path.join(__dirname, "..", "public", "audio");
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  const audioPath = path.join(publicPath, audioFilename);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(audioPath, response.audioContent, "binary");
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
