/** @format */

const axios = require("axios");

async function getDefinitionAndExamples(word, defination) {
  const prompt = `Provide only an example sentence for the word "${word}" based on the definition "${defination}". Just return the example sentence without any additional text. `;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini", // hoặc 'gpt-4' nếu bạn có quyền truy cập
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GPT_KEY}`,
        },
      }
    );

    const messageContent = response.data.choices[0].message.content;
    return messageContent;
  } catch (error) {
    console.error("Error fetching definition and examples:", error);
    return null;
  }
}
module.exports = { getDefinitionAndExamples };
