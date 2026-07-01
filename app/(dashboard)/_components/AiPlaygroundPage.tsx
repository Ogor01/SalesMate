"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader, AlertCircle, Bot, RefreshCw, MessageSquare, Info } from "lucide-react";

interface ChatBubble {
  role: "customer" | "ai";
  content: string;
}

export default function AiPlaygroundPage() {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions] = useState([
    "Hi, what products do you have?",
    "Do you have this in blue?",
    "How much is your Ankara gown?",
    "What sizes are available?",
    "How long does delivery take?",
    "What payment methods do you accept?",
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [vendorProducts, setVendorProducts] = useState<number>(0);
  const [vendorFaqs, setVendorFaqs] = useState<number>(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setVendorProducts(j.data.length);
      })
      .catch(() => {});
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setVendorFaqs(j.data.length);
      })
      .catch(() => {});
  }, []);

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    setError("");

    const customerMsg: ChatBubble = { role: "customer", content: msg };
    const updatedMessages = [...messages, customerMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        const aiMsg: ChatBubble = {
          role: "ai",
          content: json.data.reply,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setError(json.error?.message || "AI failed to respond");
      }
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (text: string) => {
    sendMessage(text);
  };

  const handleClear = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div style={{ display: "flex", flex: 1, height: "calc(100vh - 64px)", background: "var(--color-background)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF" }}>
          <div>
            <h2 style={{ fontSize: "var(--size-h2)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={20} /> AI Test Chat
            </h2>
            <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>
              Test how the AI responds to customers before going live.
              Simulates the same AI that answers WhatsApp messages.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {vendorProducts > 0 && vendorFaqs > 0 ? (
              <span style={{ fontSize: "10px", color: "var(--color-primary)", background: "var(--color-primary-surface)", padding: "4px 8px", borderRadius: "4px" }}>
                {vendorProducts} products &middot; {vendorFaqs} FAQs loaded
              </span>
            ) : (
              <span style={{ fontSize: "10px", color: "var(--color-muted-foreground)", background: "var(--color-muted)", padding: "4px 8px", borderRadius: "4px" }}>
                No products or FAQs added yet. AI responses will be generic.
              </span>
            )}
            <button onClick={handleClear} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
              <RefreshCw size={12} /> Clear
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "12px", background: "#F9FAFB" }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: "var(--color-muted-foreground)", padding: "40px 20px" }}>
              <MessageSquare size={40} strokeWidth={1} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <h3 style={{ fontSize: "16px", marginBottom: "6px", color: "var(--color-foreground)" }}>Start a test conversation</h3>
              <p style={{ fontSize: "13px", marginBottom: "16px" }}>
                Type a message below or click a suggestion to see how the AI responds.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", maxWidth: "500px", margin: "0 auto" }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(s)}
                    style={{
                      padding: "6px 14px",
                      background: "#FFFFFF",
                      border: "var(--border-default)",
                      borderRadius: "20px",
                      fontSize: "12px",
                      cursor: "pointer",
                      color: "var(--color-primary-text)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === "customer" ? "flex-end" : "flex-start", maxWidth: "75%", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "9px", color: "gray", alignSelf: msg.role === "customer" ? "flex-end" : "flex-start" }}>
                {msg.role === "customer" ? "You (Customer)" : "AI Sales Rep"}
              </span>
              <div
                style={{
                  background: msg.role === "customer" ? "var(--color-primary)" : "#FFFFFF",
                  color: msg.role === "customer" ? "#FFFFFF" : "var(--color-foreground)",
                  border: msg.role === "customer" ? "none" : "var(--border-default)",
                  padding: "10px 14px",
                  borderRadius: msg.role === "customer" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", maxWidth: "75%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#FFFFFF", border: "var(--border-default)", borderRadius: "16px 16px 16px 4px" }}>
              <Loader size={14} className="animate-spin" />
              <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>AI is thinking...</span>
            </div>
          )}

          {error && (
            <div style={{ alignSelf: "center", background: "var(--color-destructive-surface)", border: "var(--border-error)", padding: "8px 14px", borderRadius: "8px", color: "var(--color-destructive)", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#FFFFFF", padding: "16px", borderTop: "var(--border-default)", display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Type a customer message to test..."
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "10px 20px", height: "38px", display: "flex", alignItems: "center", gap: "6px" }} disabled={loading || !input.trim()}>
            {loading ? <Loader size={16} className="animate-spin" /> : <><Send size={16} /> Send</>}
          </button>
        </form>
      </div>
    </div>
  );
}
