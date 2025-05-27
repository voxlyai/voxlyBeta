export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔁 Dummy AI response (replace this with OpenAI logic later)
    const fakeBotReply = `You said: "${message}". That's interesting!`;

    res.status(200).json({ response: fakeBotReply });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
