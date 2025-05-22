export default async function handler(req, res) {
  const { message } = req.body;

  try {
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await apiRes.json();
    const reply = data.choices?.[0]?.message?.content || "Oops, something went wrong.";
   res.status(200).json({ reply });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ message: "Error fetching from OpenAI." });
  }
}
