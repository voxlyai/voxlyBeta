export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userMessage = req.body.message;
  const userName = req.body.name;
const userEmail = req.body.email;
const agentId = req.body.agent_id;


  if (!userMessage) {
    return res.status(400).json({ error: 'Missing message' });
  }

  // 🧠 Local memory per request (not global)
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
    await fetch('https://ceelklkoytgghpwckyyg.supabase.co/functions/v1/create-lead', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` // your Supabase anon key
  },
  body: JSON.stringify({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    agent_id: req.body.agent_id
  })
});

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'No response from GPT' });
    }
    
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error contacting OpenAI' });
  }
}
