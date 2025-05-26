export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message: userMessage, name: userName, email: userEmail, agent_id: agentId } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'Missing message' });
  }

  const conversationHistory = [
    {
      role: "system",
      content: "You are Voxly, a friendly AI sales assistant that helps users with product questions, bookings, and general inquiries. Respond clearly, concisely, and with a helpful tone."
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    // 🔁 Get GPT Response
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
    console.log("GPT raw response:", JSON.stringify(data, null, 2));

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'No response from GPT' });
    }

    // 📥 Log Lead to Supabase
    await fetch('https://ceelklkoytgghpwckyyg.supabase.co/functions/v1/create-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        message: userMessage,
        agent_id: agentId
      })
    });

    // ✅ Send reply back to frontend
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error contacting OpenAI or Supabase' });
  }
}
