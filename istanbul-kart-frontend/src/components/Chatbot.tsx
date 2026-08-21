import React, { useState } from "react";
import "./Chatbot.css";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Hello! I am your Istanbulkart assistant. How can I help you today?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/chatbot/ask", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: "bot", text: data.reply || "No response received." }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I encountered an error answering that." }]);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { sender: "bot", text: "Cannot reach chatbot service." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="chatbot-widget-container">
      {!isChatOpen ? (
        <button className="gemini-float-btn" onClick={() => setIsChatOpen(true)}>
          <svg viewBox="0 0 256 256" className="glass-icon" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="geminiGrad1" cx="78%" cy="55%" r="78%" fx="78%" fy="55%">
                <stop offset="0%" stopColor="#1ba1e3" />
                <stop offset="30%" stopColor="#5489d6" />
                <stop offset="54%" stopColor="#9b72cb" />
                <stop offset="82%" stopColor="#d96570" />
                <stop offset="100%" stopColor="#f49c46" />
              </radialGradient>
              <radialGradient id="geminiGrad2" cx="-3%" cy="-54%" r="169%" fx="-3%" fy="-54%">
                <stop offset="0%" stopColor="#1ba1e3" />
                <stop offset="30%" stopColor="#5489d6" />
                <stop offset="54%" stopColor="#9b72cb" />
                <stop offset="82%" stopColor="#d96570" />
                <stop offset="100%" stopColor="#f49c46" />
              </radialGradient>
            </defs>
            <g transform="translate(53, 53) scale(0.58)" filter="drop-shadow(0 0 15px rgba(27, 161, 227, 0.4))">
              <path fill="url(#geminiGrad1)" d="m122.062 172.77l-10.27 23.52c-3.947 9.042-16.459 9.042-20.406 0l-10.27-23.52c-9.14-20.933-25.59-37.595-46.108-46.703L6.74 113.52c-8.987-3.99-8.987-17.064 0-21.053l27.385-12.156C55.172 70.97 71.917 53.69 80.9 32.043L91.303 6.977c3.86-9.303 16.712-9.303 20.573 0l10.403 25.066c8.983 21.646 25.728 38.926 46.775 48.268l27.384 12.156c8.987 3.99 8.987 17.063 0 21.053l-28.267 12.547c-20.52 9.108-36.97 25.77-46.109 46.703" />
              <path fill="url(#geminiGrad2)" d="m217.5 246.937l-2.888 6.62c-2.114 4.845-8.824 4.845-10.937 0l-2.889-6.62c-5.148-11.803-14.42-21.2-25.992-26.34l-8.898-3.954c-4.811-2.137-4.811-9.131 0-11.269l8.4-3.733c11.87-5.273 21.308-15.017 26.368-27.22l2.966-7.154c2.067-4.985 8.96-4.985 11.027 0l2.966 7.153c5.06 12.204 14.499 21.948 26.368 27.221l8.4 3.733c4.812 2.138 4.812 9.132 0 11.27l-8.898 3.953c-11.571 5.14-20.844 14.537-25.992 26.34" />
            </g>
          </svg>
        </button>
      ) : (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Gemini Istanbulkart Assistant</span>
            <button className="chatbot-close-btn" onClick={() => setIsChatOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages-body">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.sender}`}>
                {m.text}
              </div>
            ))}
            {isChatLoading && (
              <div className="chatbot-typing">
                Assistant is typing...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-form">
            <input 
              type="text" 
              placeholder="Ask about cards, fares..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send-btn">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;