import { useState } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! Welcome to Voxly. How can I assist you today?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = { from: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();
      console.log("API response:", data);

      const botMessage = { from: "bot", text: data.response || "Sorry, I didn't understand that." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { from: "bot", text: "Oops! Something went wrong." }]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>Voxly.ai – Your 24/7 AI Assistant</h2>

      <div style={{ border: "1px solid #ddd", padding: 15, height: 400, overflowY: "scroll", marginBottom: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "10px 0" }}>
            <span
              style={{
                display: "inline-block",
                padding: "10px 15px",
                borderRadius: 15,
                backgroundColor: msg.from === "user" ? "#007bff" : "#e0e0e0",
                color: msg.from === "user" ? "#fff" : "#000",
                maxWidth: "80%",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {isTyping && (
          <div style={{ textAlign: "left", fontStyle: "italic", color: "#999", marginTop: 5 }}>Voxly is typing...</div>
        )}
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />
        <button onClick={handleSend} style={{ padding: "10px 20px", fontSize: 16, marginLeft: 10 }}>
          Send
        </button>
      </div>
    </div>
  );
}
