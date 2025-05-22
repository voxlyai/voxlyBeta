// api/chat.js (Node.js endpoint for Vercel)

let conversationHistory = [
  {
    role: "system",
    content: "You are Voxly, a friendly AI sales assistant that helps users with product questions, booking, and general inquiries. Respond clearly, concisely, and in a helpful tone."
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    conversationHistory.push({ role: "user", content: userMessage });

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: conversationHistory,
      }),
    });

    const data = await completion.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'No response from GPT' });
    }

    conversationHistory.push({ role: "assistant", content: reply });

    // Limit history to avoid token overrun
    if (conversationHistory.length > 20) {
      conversationHistory.splice(1, 2); // Keep system message, trim oldest
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error contacting OpenAI' });
  }
}
