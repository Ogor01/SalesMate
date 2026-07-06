"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Loader, AlertCircle, Send, User, RefreshCw,
  CheckCheck, MoreVertical, Bot, MessageSquare, Smartphone,
  ArrowLeft, Phone, Clock, ShieldAlert, Sparkles, UserCheck
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

function fmtPhone(p: string) {
  let clean = p.replace(/^whatsapp:/, "").trim();
  if (!clean.startsWith("+") && /^\d+$/.test(clean)) {
    clean = "+" + clean;
  }
  // Format Nigeria (+234) phone numbers cleanly
  if (clean.startsWith("+234") && clean.length >= 13) {
    return `+234 ${clean.slice(4,7)} ${clean.slice(7,10)} ${clean.slice(10)}`;
  }
  // Format US (+1) phone numbers cleanly
  if (clean.startsWith("+1") && clean.length === 12) {
    return `+1 (${clean.slice(2,5)}) ${clean.slice(5,8)}-${clean.slice(8)}`;
  }
  return clean;
}

function ago(ts: string) {
  const d = Date.now() - new Date(ts).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function msgTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dateLabel(ts: string) {
  const d = new Date(ts);
  const n = new Date();
  if (d.toDateString() === n.toDateString()) return "Today";
  const y = new Date(n); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
}

function avatarColor(p: string) {
  const colors = ["#4F46E5", "#3B82F6", "#06B6D4", "#0D9488", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
  return colors[p.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "escalated">("all");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileList, setMobileList] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchAll = async (auto = false) => {
    try {
      const r = await fetch("/api/conversations");
      const j = await r.json();
      if (r.ok) {
        const list: Conversation[] = j.data || [];
        setConversations(list);
        if (list.length) {
          if (auto || !selected) {
            setSelected(list[0]);
            setMobileList(false);
          } else {
            const c = list.find(x => x.id === selected.id);
            if (c) setSelected(c);
          }
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);
    const i = setInterval(() => fetchAll(false), 10000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.conversationHistory]);

  const toggleEsc = async (chat: Conversation) => {
    const next = !chat.isEscalated;
    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, isEscalated: next } : c));
    if (selected?.id === chat.id) setSelected({ ...selected, isEscalated: next });
    try {
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: chat.customerPhone,
          messageText: `[System] AI ${next ? "PAUSED" : "RESUMED"}`,
          toggleEscalation: next
        })
      });
    } catch {}
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true);
    setError("");
    try {
      const r = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: selected.customerPhone,
          messageText: text,
          toggleEscalation: false
        })
      });
      const j = await r.json();
      if (r.ok) {
        setText("");
        await fetchAll(false);
      } else {
        setError(j.error?.message || "Failed to send");
      }
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(c => {
    const p = c.customerPhone.includes(search);
    const f = filter === "all" || (filter === "escalated" && c.isEscalated);
    return p && f;
  });

  const lastMsg = (c: Conversation) => c.conversationHistory?.[c.conversationHistory.length - 1];

  const renderLastMsgPreview = (chat: Conversation) => {
    const last = lastMsg(chat);
    if (!last) return "No messages yet";
    const prefix = last.role === "vendor" ? "You: " : last.role === "ai" ? "AI: " : "";
    return `${prefix}${last.content}`;
  };

  const renderBubble = (msg: ChatMessage, i: number, arr: ChatMessage[]) => {
    const isCus = msg.role === "customer";
    const isAi = msg.role === "ai";
    const prev = arr[i - 1];
    const next = arr[i + 1];
    const gStart = !prev || prev.role !== msg.role;
    const gEnd = !next || next.role !== msg.role;

    return (
      <div key={i} className={`bubble-row ${msg.role}`}>
        {gStart && !isCus && (
          <div className="bubble-meta-header">
            {isAi ? (
              <>
                <Bot size={11} style={{ color: "var(--color-primary-text)" }} />
                <span style={{ color: "var(--color-primary-text)", fontWeight: 600 }}>AI Agent</span>
                <span className="confidence-tag">
                  {selected ? Math.round(selected.aiConfidenceScore * 100) : 0}% Conf
                </span>
              </>
            ) : (
              <>
                <User size={11} style={{ color: "var(--color-muted-foreground)" }} />
                <span style={{ color: "var(--color-muted-foreground)", fontWeight: 600 }}>You (Vendor)</span>
              </>
            )}
          </div>
        )}
        <div style={{ position: "relative", maxWidth: "85%" }}>
          <div className="bubble-card">
            {msg.content}
          </div>
          {gEnd && (
            <div className="bubble-meta-footer">
              <span>{msgTime(msg.timestamp)}</span>
              {!isCus && <CheckCheck size={12} style={{ color: "var(--color-primary)" }} />}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    if (!selected) return null;
    const list: React.ReactNode[] = [];
    let lastDate = "";

    selected.conversationHistory.forEach((msg, i, arr) => {
      const currentDate = new Date(msg.timestamp).toDateString();
      if (currentDate !== lastDate) {
        list.push(
          <div key={`date-${msg.timestamp}-${i}`} className="date-divider">
            <span className="date-pill">{dateLabel(msg.timestamp)}</span>
          </div>
        );
        lastDate = currentDate;
      }
      list.push(renderBubble(msg, i, arr));
    });

    return list;
  };

  const chatView = selected ? (
    <>
      <div className="chat-header">
        <div className="header-user-info">
          <button onClick={() => setMobileList(true)} className="back-btn">
            <ArrowLeft size={18} />
          </button>
          <div className="avatar-wrapper">
            <div className="avatar-circle" style={{ background: avatarColor(selected.customerPhone) }}>
              <User size={18} color="#FFFFFF" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="header-name">{fmtPhone(selected.customerPhone)}</div>
            <div className="header-status">
              {selected.isEscalated ? (
                <span style={{ color: "var(--color-destructive)", display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
                  <ShieldAlert size={12} /> Human takeover active
                </span>
              ) : (
                <span style={{ color: "var(--color-primary-text)", display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
                  <Bot size={12} /> AI Auto-responding
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={() => toggleEsc(selected)}
            className={`takeover-btn ${selected.isEscalated ? "human-mode" : "ai-mode"}`}
          >
            {selected.isEscalated ? (
              <>
                <Bot size={13} />
                <span>Resume AI Auto</span>
              </>
            ) : (
              <>
                <UserCheck size={13} />
                <span>Take Over Chat</span>
              </>
            )}
          </button>
          <button className="btn-icon">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="messages-scroller">
        {selected.conversationHistory?.length ? (
          <>
            {renderMessages()}
          </>
        ) : (
          <div className="empty-state" style={{ background: "transparent" }}>
            <div className="empty-graphic">
              <MessageSquare size={32} color="var(--color-muted-foreground)" strokeWidth={1} />
            </div>
            <h3 className="empty-title">No messages</h3>
            <p className="empty-subtitle">Start chatting with this user via WhatsApp.</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMsg} className="input-panel">
        <div className="input-container">
          <textarea
            placeholder={selected.isEscalated ? "Reply directly to customer..." : "Type a message to manually take over..."}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim() && !sending) {
                  sendMsg(e);
                }
              }
            }}
            disabled={sending}
            className="chat-input"
            rows={1}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="chat-send-btn"
          >
            {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="input-disclaimer">
          <Smartphone size={10} />
          <span>
            {selected.isEscalated
              ? "AI is currently paused. Messages are sent directly to the customer's WhatsApp."
              : "AI is active. Sending a message will automatically switch this conversation to Human Takeover."}
          </span>
        </div>
      </form>
    </>
  ) : null;

  const sidebar = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#FFFFFF" }}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <MessageSquare size={18} color="var(--color-primary-text)" />
          <span>Inbox</span>
        </h2>
        <button
          onClick={() => {
            setLoading(true);
            fetchAll(false);
          }}
          className="btn-icon"
          title="Refresh Chats"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="tabs-container">
        <button
          onClick={() => setFilter("all")}
          className={`tab-btn ${filter === "all" ? "active-all" : ""}`}
        >
          <span>All Chats</span>
          <span style={{ 
            fontSize: "10px", 
            background: filter === "all" ? "rgba(37, 211, 102, 0.15)" : "rgba(0,0,0,0.06)", 
            padding: "2px 6px", 
            borderRadius: "10px",
            color: filter === "all" ? "var(--color-primary-text)" : "var(--color-muted-foreground)",
            fontWeight: 700
          }}>
            {filtered.length}
          </span>
        </button>
        <button
          onClick={() => setFilter("escalated")}
          className={`tab-btn ${filter === "escalated" ? "active-escalated" : ""}`}
        >
          <span>Escalated</span>
          <span style={{ 
            fontSize: "10px", 
            background: filter === "escalated" ? "rgba(239, 68, 68, 0.15)" : "rgba(0,0,0,0.06)", 
            padding: "2px 6px", 
            borderRadius: "10px",
            color: filter === "escalated" ? "var(--color-destructive)" : "var(--color-muted-foreground)",
            fontWeight: 700
          }}>
            {conversations.filter(c => c.isEscalated).length}
          </span>
        </button>
      </div>

      <div className="chat-list">
        {loading && !conversations.length ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader size={18} className="animate-spin" color="var(--color-primary)" />
          </div>
        ) : !filtered.length ? (
          <div className="empty-state" style={{ padding: "60px 20px" }}>
            <div className="empty-graphic" style={{ width: 60, height: 60 }}>
              <MessageSquare size={24} color="var(--color-muted-foreground)" strokeWidth={1} />
            </div>
            <h3 className="empty-title" style={{ fontSize: "14px" }}>No conversations</h3>
            <p className="empty-subtitle" style={{ fontSize: "12px" }}>
              {search ? "No matches found" : "No active customer inquiries yet."}
            </p>
          </div>
        ) : (
          filtered.map(chat => {
            const sel = selected?.id === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => {
                  setSelected(chat);
                  setMobileList(false);
                }}
                className={`chat-item ${sel ? "selected" : ""} ${chat.isEscalated ? "escalated" : ""}`}
              >
                <div className="avatar-wrapper">
                  <div className="avatar-circle" style={{ background: avatarColor(chat.customerPhone) }}>
                    <User size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </div>
                  <div className={`avatar-status-badge ${chat.isEscalated ? "status-escalated" : "status-ai"}`}>
                    {chat.isEscalated ? <AlertCircle size={9} color="#FFFFFF" /> : <Bot size={9} color="#FFFFFF" />}
                  </div>
                </div>
                <div className="item-content">
                  <div className="item-header">
                    <span className="item-phone">{fmtPhone(chat.customerPhone)}</span>
                    <span className="item-time">{lastMsg(chat) ? ago(lastMsg(chat)!.timestamp) : ""}</span>
                  </div>
                  <span className="item-preview">{renderLastMsgPreview(chat)}</span>
                  <div className="item-meta">
                    <span className={`meta-badge ${chat.isEscalated ? "badge-manual" : "badge-ai"}`}>
                      {chat.isEscalated ? "Manual" : "AI Auto"}
                    </span>
                    {!chat.isEscalated && (
                      <span className="meta-score">
                        {Math.round(chat.aiConfidenceScore * 100)}% Match
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <span>{conversations.length} total customer threads</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Smartphone size={10} /> Live</span>
      </div>
    </div>
  );

  return (
    <div className="chat-container">
      {error && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button onClick={() => setError("")} className="error-close-btn">&times;</button>
        </div>
      )}

      <div className={`chat-sidebar ${mobileList ? "show" : ""}`}>
        {sidebar}
      </div>

      <div className={`chat-main ${!mobileList ? "show" : ""}`}>
        {chatView ? chatView : (
          <div className="empty-state">
            <div className="empty-graphic">
              <MessageSquare size={36} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3 className="empty-title">Select a Conversation</h3>
            <p className="empty-subtitle">
              Choose a customer thread from the sidebar list to view the message history, monitor AI confidence, and manually reply when needed.
            </p>
          </div>
        )}
      </div>

      <style>{`
        /* Core UI Layout */
        .chat-container {
          display: flex;
          flex: 1;
          height: calc(100vh - 64px);
          overflow: hidden;
          position: relative;
          background-color: var(--color-background);
          font-family: var(--font-body), sans-serif;
        }

        .chat-sidebar {
          width: 380px;
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          background-color: #FFFFFF;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }

        .sidebar-header {
          padding: var(--space-4) var(--space-5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-title {
          font-size: var(--size-h3);
          font-weight: var(--weight-bold);
          color: var(--color-foreground);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .btn-icon {
          background: transparent;
          border: none;
          color: var(--color-muted-foreground);
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          background-color: var(--color-muted);
          color: var(--color-foreground);
        }

        .search-container {
          padding: var(--space-3) var(--space-4);
          position: relative;
          border-bottom: 1px solid var(--color-border);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--color-muted-foreground);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          font-size: var(--size-body-sm);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background-color: var(--color-background);
          outline: none;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: var(--color-primary);
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
        }

        .tabs-container {
          display: flex;
          padding: 6px var(--space-4);
          background-color: var(--color-background);
          gap: 4px;
        }

        .tab-btn {
          flex: 1;
          padding: 8px 12px;
          font-size: var(--size-caption);
          font-weight: var(--weight-semibold);
          background: transparent;
          color: var(--color-muted-foreground);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .tab-btn:hover {
          color: var(--color-foreground);
          background-color: rgba(0, 0, 0, 0.03);
        }

        .tab-btn.active-all {
          background-color: var(--color-primary-surface);
          color: var(--color-primary-text);
        }

        .tab-btn.active-escalated {
          background-color: var(--color-destructive-surface);
          color: var(--color-destructive);
        }

        .chat-list {
          flex: 1;
          overflow-y: auto;
        }

        .chat-item {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          cursor: pointer;
          border-bottom: 1px solid var(--color-border);
          transition: all 0.2s ease;
          position: relative;
        }

        .chat-item:hover {
          background-color: #F8FAFC;
        }

        .chat-item.selected {
          background-color: #F1F5F9;
        }

        .chat-item::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--color-primary);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .chat-item.selected::after {
          opacity: 1;
        }

        .chat-item.selected.escalated::after {
          background-color: var(--color-destructive);
        }

        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: var(--weight-bold);
          font-size: 13px;
          box-shadow: var(--shadow-sm);
        }

        .avatar-status-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
          box-shadow: var(--shadow-sm);
        }

        .status-ai {
          background-color: var(--color-primary);
        }

        .status-escalated {
          background-color: var(--color-destructive);
        }

        .item-content {
          flex: 1;
          min-width: 0;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .item-phone {
          font-weight: var(--weight-semibold);
          font-size: var(--size-body-sm);
          color: var(--color-foreground);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-time {
          font-size: 11px;
          color: var(--color-muted-foreground);
          flex-shrink: 0;
          margin-left: 6px;
        }

        .item-preview {
          font-size: 13px;
          color: var(--color-muted-foreground);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
        }

        .meta-badge {
          font-size: var(--size-micro);
          font-weight: var(--weight-bold);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }

        .meta-badge.badge-ai {
          background-color: var(--color-primary-surface);
          color: var(--color-primary-text);
          border: 1px solid var(--color-primary-border);
        }

        .meta-badge.badge-manual {
          background-color: var(--color-destructive-surface);
          color: var(--color-destructive);
          border: 1px solid var(--border-error);
        }

        .meta-score {
          font-size: var(--size-micro);
          color: var(--color-muted-foreground);
        }

        .sidebar-footer {
          padding: var(--space-2) var(--space-4);
          border-top: 1px solid var(--color-border);
          background-color: var(--color-background);
          font-size: var(--size-micro);
          color: var(--color-muted-foreground);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Active Chat main area */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background-color: #FFFFFF;
        }

        .chat-header {
          padding: var(--space-3) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #FFFFFF;
          z-index: 5;
        }

        .header-user-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .back-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--radius-full);
          color: var(--color-foreground);
          transition: background-color 0.2s;
        }

        .back-btn:hover {
          background-color: var(--color-muted);
        }

        .header-name {
          font-weight: var(--weight-semibold);
          font-size: var(--size-body-lg);
          color: var(--color-foreground);
        }

        .header-status {
          font-size: var(--size-caption);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .takeover-btn {
          border: none;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--size-caption);
          font-weight: var(--weight-bold);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }

        .takeover-btn.ai-mode {
          background-color: var(--color-destructive);
          color: #FFFFFF;
        }

        .takeover-btn.ai-mode:hover {
          background-color: #DC2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
          transform: translateY(-1px);
        }

        .takeover-btn.human-mode {
          background-color: var(--color-primary);
          color: #FFFFFF;
        }

        .takeover-btn.human-mode:hover {
          background-color: var(--color-primary-dark);
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
          transform: translateY(-1px);
        }

        /* Message flow */
        .messages-scroller {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-5);
          background-color: var(--color-background);
          background-image: radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 0);
          background-size: 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .date-divider {
          display: flex;
          justify-content: center;
          margin: var(--space-4) 0;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .date-pill {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid var(--color-border);
          color: var(--color-muted-foreground);
          font-size: var(--size-micro);
          font-weight: var(--weight-semibold);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-sm);
        }

        /* Bubble Row styles */
        .bubble-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 2px;
          animation: bubbleFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bubble-row.customer {
          align-items: flex-start;
          padding-right: 20%;
        }

        .bubble-row.ai,
        .bubble-row.vendor {
          align-items: flex-end;
          padding-left: 20%;
        }

        .bubble-meta-header {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 4px;
          font-size: var(--size-micro);
        }

        .confidence-tag {
          font-size: 8px;
          background: rgba(37, 211, 102, 0.12);
          color: var(--color-primary-text);
          padding: 1px 5px;
          border-radius: 4px;
          font-weight: 700;
        }

        .bubble-card {
          position: relative;
          padding: 10px 14px;
          border-radius: var(--radius-xl);
          font-size: 13.5px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
        }

        .customer .bubble-card {
          background-color: #FFFFFF;
          color: var(--color-foreground);
          border-top-left-radius: 4px;
        }

        .ai .bubble-card {
          background-color: var(--color-primary-surface);
          color: var(--color-foreground);
          border: 1px solid var(--color-primary-border);
          border-top-right-radius: 4px;
        }

        .vendor .bubble-card {
          background-color: #EEF2F6;
          color: var(--color-foreground);
          border: 1px solid #D0D7DE;
          border-top-right-radius: 4px;
        }

        .bubble-meta-footer {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
          font-size: var(--size-micro);
          color: var(--color-muted-foreground);
        }

        .vendor .bubble-meta-footer,
        .ai .bubble-meta-footer {
          justify-content: flex-end;
        }

        /* Input layout */
        .input-panel {
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--color-border);
          background-color: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .input-container {
          display: flex;
          gap: var(--space-3);
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 12px var(--space-4);
          font-size: var(--size-body-sm);
          line-height: 1.4;
          outline: none;
          background-color: var(--color-background);
          color: var(--color-foreground);
          font-family: inherit;
          resize: none;
          max-height: 120px;
          transition: all 0.3s ease;
        }

        .chat-input:focus {
          border-color: var(--color-primary);
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.08);
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: var(--color-primary);
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }

        .chat-send-btn:hover:not(:disabled) {
          background-color: var(--color-primary-dark);
          transform: scale(1.05);
        }

        .chat-send-btn:disabled {
          background-color: var(--color-muted-foreground);
          opacity: 0.4;
          cursor: default;
        }

        .input-disclaimer {
          font-size: var(--size-micro);
          color: var(--color-muted-foreground);
          display: flex;
          align-items: center;
          gap: 4px;
          padding-left: var(--space-1);
        }

        /* Empty states & Errors */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--color-background);
          padding: var(--space-8);
          gap: var(--space-4);
        }

        .empty-graphic {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background-color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
        }

        .empty-title {
          font-size: var(--size-h3);
          font-weight: var(--weight-bold);
          color: var(--color-foreground);
        }

        .empty-subtitle {
          font-size: var(--size-body-sm);
          color: var(--color-muted-foreground);
          text-align: center;
          max-width: 280px;
          line-height: 1.5;
        }

        .error-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background-color: var(--color-destructive-surface);
          border-bottom: 1px solid var(--border-error);
          padding: 10px var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--size-body-sm);
          color: var(--color-destructive);
          animation: slideDown 0.3s ease;
        }

        .error-close-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--color-destructive);
          cursor: pointer;
          font-size: var(--size-h2);
          line-height: 1;
        }

        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-sidebar {
            width: 100% !important;
            position: absolute !important;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: none !important;
          }
          .chat-sidebar.show {
            display: flex !important;
          }
          .chat-main {
            width: 100% !important;
            position: absolute !important;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: none !important;
          }
          .chat-main.show {
            display: flex !important;
          }
          .back-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
