import { Configuration, OpenAIApi } from "openai";

// Setup OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// API Handler
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Block non-POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // OpenAI Chat Completion
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content: "You are Voxly, a helpful AI assistant designed to help business owners grow.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = response.data.choices[0].message.content.trim();

    // Respond to frontend
    res.status(200).json({ response: reply });
  } catch (error) {
    console.error("Chat API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong with the AI response" });
  }
}
