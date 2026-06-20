"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Send,
  User,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface ChatMessage {
  role: "customer" | "ai" | "vendor";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  customerPhone: string;
  conversationHistory: ChatMessage[];
  aiConfidenceScore: number;
  isEscalated: boolean;
  createdAt: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "escalated">("all");

  // Chat message composer
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async (autoSelect = false) => {
    try {
      const res = await fetch("/api/conversations");
      const json = await res.json();
      if (res.ok) {
        const list: Conversation[] = json.data || [];
        setConversations(list);

        // Auto select first conversation or keep selection updated
        if (list.length > 0) {
          if (autoSelect || !selectedChat) {
            setSelectedChat(list[0]);
          } else {
            const current = list.find((c) => c.id === selectedChat.id);
            if (current) setSelectedChat(current);
          }
        }
      } else {
        setError(json.error?.message || "Failed to load chats.");
      }
    } catch (err) {
      setError("Network error loading inbox conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(true);
  }, []);

  // Scroll to bottom of chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.conversationHistory]);

  // Handle merchant manual takeover toggle
  const handleToggleTakeover = async (chat: Conversation) => {
    const nextEscalatedState = !chat.isEscalated;
    
    // Optimistic UI update
    setConversations((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, isEscalated: nextEscalatedState } : c))
    );
    if (selectedChat && selectedChat.id === chat.id) {
      setSelectedChat({ ...selectedChat, isEscalated: nextEscalatedState });
    }

    try {
      // Send manual takeover payload to Backend.
      // We trigger standard takeover event or mock api parameters update.
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: chat.customerPhone,
          messageText: `[Takeover event: AI response mode ${nextEscalatedState ? "PAUSED" : "RESUMED"}]`,
          toggleEscalation: nextEscalatedState,
        }),
      });
    } catch (e) {
      console.error("Takeover toggle sync failed:", e);
    }
  };

  // Deliver merchant response manually
  const handleSendManualMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText || !selectedChat) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: selectedChat.customerPhone,
          messageText: composerText,
          toggleEscalation: false, // replying manually clears the escalation takeover alert!
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setComposerText("");
        // Refresh conversations to pull final records
        await fetchConversations(false);
      } else {
        setError(json.error?.message || "Failed to send manual WhatsApp reply.");
      }
    } catch (err) {
      setError("Network error delivering WhatsApp response.");
    } finally {
      setSending(false);
    }
  };

  // Filter conversations list
  const filteredChats = conversations.filter((c) => {
    const matchesPhone = c.customerPhone.includes(searchQuery);
    const matchesFilter = filterMode === "all" || (filterMode === "escalated" && c.isEscalated);
    return matchesPhone && matchesFilter;
  });

  return (
    <div style={{ display: "flex", flex: 1, height: "100vh", background: "var(--color-background)" }}>
      {/* LEFT PANE: CONVERSATION LIST */}
      <div
        style={{
          width: "300px",
          borderRight: "var(--border-default)",
          display: "flex",
          flexDirection: "column",
          background: "#FFFFFF",
        }}
      >
        {/* Search header */}
        <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "var(--size-h2)", fontWeight: "bold" }}>Inbox Chats</h2>
            <button
              onClick={() => fetchConversations(false)}
              style={{ background: "none", border: "none", color: "var(--color-muted-foreground)", cursor: "pointer" }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color="var(--color-muted-foreground)"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search phone number..."
              className="input-field"
              style={{ paddingLeft: "30px", fontSize: "11px", height: "32px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", padding: "0 var(--space-4) 8px var(--space-4)", borderBottom: "var(--border-default)", gap: "4px" }}>
          <button
            className="btn-secondary"
            style={{
              flex: 1,
              padding: "4px",
              fontSize: "10px",
              background: filterMode === "all" ? "var(--color-muted)" : "transparent",
              border: filterMode === "all" ? "1px solid rgba(0,0,0,0.15)" : "none",
            }}
            onClick={() => setFilterMode("all")}
          >
            All chats
          </button>
          <button
            className="btn-secondary"
            style={{
              flex: 1,
              padding: "4px",
              fontSize: "10px",
              background: filterMode === "escalated" ? "var(--color-destructive-surface)" : "transparent",
              color: filterMode === "escalated" ? "var(--color-destructive)" : "var(--color-muted-foreground)",
              border: filterMode === "escalated" ? "1px solid rgba(239,68,68,0.2)" : "none",
            }}
            onClick={() => setFilterMode("escalated")}
          >
            Urgent Alerts ⚠️
          </button>
        </div>

        {/* Conversations List scrolling view */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
              <Loader size={18} className="animate-spin" color="var(--color-primary)" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div style={{ padding: "var(--space-5)", textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>
              No conversations found.
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMsg = chat.conversationHistory?.[chat.conversationHistory.length - 1];
              const isSelected = selectedChat && selectedChat.id === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  style={{
                    padding: "var(--space-4)",
                    borderBottom: "var(--border-default)",
                    cursor: "pointer",
                    background: isSelected ? "var(--color-primary-surface)" : "#FFFFFF",
                    transition: "background 0.2s",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "var(--size-body)", fontFamily: "var(--font-mono)" }}>
                      {chat.customerPhone}
                    </span>
                    <span style={{ fontSize: "9px", color: "gray" }}>
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "var(--size-caption)",
                      color: "var(--color-muted-foreground)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "240px",
                    }}
                  >
                    {lastMsg ? lastMsg.content : "No messages."}
                  </p>

                  {/* Badges indicators */}
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }}>
                    {chat.isEscalated && (
                      <span
                        style={{
                          background: "var(--color-destructive-surface)",
                          color: "var(--color-destructive)",
                          border: "var(--border-error)",
                          fontSize: "8px",
                          fontWeight: "bold",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        Handoff ⚠️
                      </span>
                    )}
                    <span style={{ fontSize: "9px", color: "var(--color-primary-text)" }}>
                      AI: {Math.round(chat.aiConfidenceScore * 100)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: ACTIVE CHAT SCREEN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F1F3F6" }}>
        {selectedChat ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {/* Header Info */}
            <div
              style={{
                background: "#FFFFFF",
                padding: "12px var(--space-5)",
                borderBottom: "var(--border-default)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px", fontFamily: "var(--font-mono)" }}>
                  {selectedChat.customerPhone}
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "2px" }}>
                  <span style={{ fontSize: "11px", color: "gray" }}>
                    AI Confidence: {Math.round(selectedChat.aiConfidenceScore * 100)}%
                  </span>
                </div>
              </div>

              {/* Takeover Control switch */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: selectedChat.isEscalated ? "var(--color-destructive)" : "var(--color-primary-text)" }}>
                  {selectedChat.isEscalated ? "AI Responding Paused" : "AI Autopilot Responding"}
                </span>
                <button
                  onClick={() => handleToggleTakeover(selectedChat)}
                  style={{ background: "none", border: "none", color: selectedChat.isEscalated ? "var(--color-destructive)" : "var(--color-primary)", cursor: "pointer", display: "flex" }}
                >
                  {selectedChat.isEscalated ? <ToggleLeft size={32} /> : <ToggleRight size={32} />}
                </button>
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <div style={{ background: "var(--color-destructive-surface)", borderBottom: "var(--border-error)", padding: "10px", color: "var(--color-destructive)", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Chat Messages Feed container */}
            <div style={{ flex: 1, padding: "var(--space-6)", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {selectedChat.conversationHistory?.map((msg, index) => {
                const isCustomer = msg.role === "customer";
                const isAi = msg.role === "ai";

                return (
                  <div
                    key={index}
                    style={{
                      alignSelf: isCustomer ? "flex-start" : "flex-end",
                      maxWidth: "70%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {/* Role indicator label */}
                    <span style={{ fontSize: "8px", color: "gray", alignSelf: isCustomer ? "flex-start" : "flex-end", textTransform: "uppercase" }}>
                      {isCustomer ? "Buyer" : isAi ? "AI Agent 🤖" : "Vendor (You) 🧑‍💼"}
                    </span>

                    {/* Bubble */}
                    <div
                      style={{
                        background: isCustomer ? "#FFFFFF" : isAi ? "#DCF8C6" : "var(--color-primary-surface)",
                        border: isCustomer ? "var(--border-default)" : isAi ? "1px solid #BBF7D0" : "1px solid var(--color-primary-border)",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        color: "var(--color-foreground)",
                        fontSize: "12px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      }}
                    >
                      {msg.content.split("\n").map((line, lidx) => (
                        <p key={lidx}>{line}</p>
                      ))}
                    </div>

                    <span style={{ fontSize: "8px", color: "gray", alignSelf: isCustomer ? "flex-start" : "flex-end" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Manual Message Input composer */}
            <form
              onSubmit={handleSendManualMessage}
              style={{
                background: "#FFFFFF",
                padding: "16px",
                borderTop: "var(--border-default)",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder={selectedChat.isEscalated ? "AI is paused. Type your response to takeover manually..." : "Type here to reply manually. Doing so will pause AI responses..."}
                className="input-field"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "10px var(--space-4)", height: "38px" }}
                disabled={sending || !composerText}
              >
                {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-muted-foreground)" }}>
            <Cpu size={48} strokeWidth={1} style={{ marginBottom: "10px" }} />
            <h3>Select a conversation</h3>
            <p style={{ fontSize: "var(--size-caption)" }}>Choose a chat to view transaction logs and reply manually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
