"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Loader, AlertCircle, Send, User, RefreshCw,
  CheckCheck, MoreVertical, Bot, MessageSquare, Smartphone,
  ArrowLeft, Phone, Clock
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
  const c = p.replace(/^whatsapp:/, "").replace(/[^\d+]/g, "");
  if (c.length === 12) return `+${c.slice(0,3)} ${c.slice(3,6)} ${c.slice(6,8)} ${c.slice(8)}`;
  if (c.length === 11) return `+${c.slice(0,1)} ${c.slice(1,4)} ${c.slice(4,7)} ${c.slice(7)}`;
  return c;
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
  return d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function avatarLabel(p: string) {
  return p.replace(/^whatsapp:/, "").replace(/[^\d]/g, "").slice(-4);
}

function avatarColor(p: string) {
  const colors = ["#25D366", "#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
  return colors[p.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
}

function BubbleTail({ left }: { left: boolean }) {
  return (
    <svg width="8" height="13" viewBox="0 0 8 13" style={{ position: "absolute", top: 0, [left ? "left" : "right"]: -7 }}>
      <path d={left ? "M8,0 C5,0 2,2 0,6 L8,6 Z" : "M0,0 C3,0 6,2 8,6 L0,6 Z"} fill={left ? "var(--color-card)" : "var(--color-primary-surface)"} />
    </svg>
  );
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
          if (auto || !selected) { setSelected(list[0]); setMobileList(false); }
          else { const c = list.find(x => x.id === selected.id); if (c) setSelected(c); }
        }
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(true); const i = setInterval(() => fetchAll(false), 10000); return () => clearInterval(i); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selected?.conversationHistory]);

  const toggleEsc = async (chat: Conversation) => {
    const next = !chat.isEscalated;
    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, isEscalated: next } : c));
    if (selected?.id === chat.id) setSelected({ ...selected, isEscalated: next });
    try { await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerPhone: chat.customerPhone, messageText: `[System] AI ${next ? "PAUSED" : "RESUMED"}`, toggleEscalation: next }) }); } catch {}
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true); setError("");
    try {
      const r = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerPhone: selected.customerPhone, messageText: text, toggleEscalation: false }) });
      const j = await r.json();
      if (r.ok) { setText(""); await fetchAll(false); } else setError(j.error?.message || "Failed to send");
    } catch { setError("Network error"); } finally { setSending(false); }
  };

  const filtered = conversations.filter(c => {
    const p = c.customerPhone.includes(search);
    const f = filter === "all" || (filter === "escalated" && c.isEscalated);
    return p && f;
  });

  const lastMsg = (c: Conversation) => c.conversationHistory?.[c.conversationHistory.length - 1];

  const renderBubble = (msg: ChatMessage, i: number, arr: ChatMessage[]) => {
    const isCus = msg.role === "customer";
    const isAi = msg.role === "ai";
    const prev = arr[i - 1];
    const next = arr[i + 1];
    const gStart = !prev || prev.role !== msg.role;
    const gEnd = !next || next.role !== msg.role;

    return (
      <div key={i} style={{
        display: "flex", flexDirection: "column",
        alignItems: isCus ? "flex-start" : "flex-end",
        marginBottom: gEnd ? 1 : 0,
        marginTop: gStart ? 10 : 0,
        paddingLeft: isCus ? 0 : 65,
        paddingRight: isCus ? 65 : 0,
        animation: "fadeIn 0.25s ease",
      }}>
        {gStart && isAi && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, marginRight: "auto" }}>
            <Bot size={10} color="var(--color-muted-foreground)" />
            <span style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontWeight: 500 }}>AI Agent</span>
            <span style={{ fontSize: 9, background: "var(--color-primary-surface)", color: "var(--color-primary-text)", padding: "0 5px", borderRadius: 3, fontWeight: 600 }}>
              {selected ? Math.round(selected.aiConfidenceScore * 100) : 0}%
            </span>
          </div>
        )}
        <div style={{ position: "relative", maxWidth: "85%" }}>
          {gStart && <BubbleTail left={isCus} />}
          <div style={{
            background: isCus ? "var(--color-card)" : "var(--color-primary-surface)",
            color: "var(--color-foreground)",
            padding: "7px 12px",
            borderRadius: isCus ? "0 8px 8px 8px" : "8px 0 8px 8px",
            fontSize: 13.3, lineHeight: 1.45,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
            border: isCus ? "1px solid var(--color-border)" : "1px solid var(--color-primary-border)",
          }}>
            {msg.content.split("\n").map((l, li) => <p key={li} style={{ margin: 0 }}>{l}</p>)}
          </div>
          {gEnd && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2, justifyContent: "flex-end", paddingRight: 4 }}>
              <span style={{ fontSize: 9.5, color: "var(--color-muted-foreground)" }}>{msgTime(msg.timestamp)}</span>
              {!isCus && <CheckCheck size={11} color="var(--color-primary)" />}
            </div>
          )}
        </div>
      </div>
    );
  };

  const chatView = selected ? (
    <>
      <div style={{ background: "var(--color-muted)", padding: "10px 16px", borderBottom: "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMobileList(true)} className="chat-back" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={20} color="var(--color-foreground)" />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarColor(selected.customerPhone), display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
            {avatarLabel(selected.customerPhone)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-foreground)" }}>{fmtPhone(selected.customerPhone)}</div>
            <div style={{ fontSize: 10.5, display: "flex", alignItems: "center", gap: 3 }}>
              {selected.isEscalated ? (
                <><span style={{ color: "var(--color-destructive)" }}><AlertCircle size={10} /> Human takeover</span></>
              ) : (
                <><Bot size={10} color="var(--color-primary-text)" /><span style={{ color: "var(--color-primary-text)" }}>AI Assistant &middot; {Math.round(selected.aiConfidenceScore * 100)}%</span></>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => toggleEsc(selected)} style={{
            background: selected.isEscalated ? "var(--color-primary)" : "var(--color-destructive-surface)",
            color: selected.isEscalated ? "#FFFFFF" : "var(--color-destructive)",
            border: "none", padding: "5px 14px", borderRadius: 18, fontSize: 10.5,
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}>
            {selected.isEscalated ? <><Bot size={12} /> Resume AI</> : <><User size={12} /> Take Over</>}
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted-foreground)", padding: 6, borderRadius: "50%", display: "flex" }}>
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0", background: "var(--color-background)", position: "relative" }}>
        {selected.conversationHistory?.length ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", margin: "0 auto 16px", position: "sticky", top: 0, zIndex: 2 }}>
              <span style={{ background: "rgba(225,245,254,0.92)", backdropFilter: "blur(8px)", color: "var(--color-muted-foreground)", fontSize: 11.5, fontWeight: 500, padding: "5px 16px", borderRadius: 7, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                {dateLabel(selected.conversationHistory[0].timestamp)}
              </span>
            </div>
            {selected.conversationHistory.map((m, i) => renderBubble(m, i, selected.conversationHistory))}
          </>
        ) : (
          <div style={{ textAlign: "center", color: "var(--color-muted-foreground)", padding: 40, fontSize: 13 }}>
            <MessageSquare size={32} strokeWidth={1} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No messages yet</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMsg} style={{ background: "var(--color-muted)", padding: "8px 14px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <input type="text" placeholder={selected.isEscalated ? "Reply as vendor..." : "Type a message..."} value={text} onChange={e => setText(e.target.value)} disabled={sending}
            style={{ width: "100%", borderRadius: 24, padding: "9px 16px", fontSize: 13.5, background: "var(--color-card)", border: "1px solid var(--color-border)", outline: "none", fontFamily: "inherit", color: "var(--color-foreground)" }}
          />
        </div>
        <button type="submit" disabled={sending || !text.trim()} style={{
          width: 42, height: 42, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: text.trim() ? "var(--color-primary)" : "var(--color-muted-foreground)", opacity: text.trim() ? 1 : 0.3,
          color: "#FFFFFF", border: "none", cursor: text.trim() ? "pointer" : "default", flexShrink: 0,
        }}>
          {sending ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </>
  ) : null;

  const sidebar = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--color-card)" }}>
      <div style={{ background: "var(--color-sidebar-bg)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={16} /> Conversations
        </h2>
        <button onClick={() => { setLoading(true); fetchAll(false); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#FFFFFF", cursor: "pointer", padding: 5, borderRadius: "50%", display: "flex" }}>
          <RefreshCw size={13} />
        </button>
      </div>

      <div style={{ padding: "8px 12px", background: "var(--color-sidebar-bg)" }}>
        <div style={{ position: "relative" }}>
          <Search size={13} color="rgba(255,255,255,0.5)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input type="text" placeholder="Search or start new chat" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 32, fontSize: 12, height: 34, background: "rgba(255,255,255,0.2)", color: "#FFFFFF", border: "none", borderRadius: 8, outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", padding: "10px 12px", gap: 6, borderBottom: "1px solid var(--color-border)" }}>
        <button onClick={() => setFilter("all")} style={{
          flex: 1, padding: "5px 0", fontSize: 11.5, fontWeight: filter === "all" ? 600 : 400,
          background: filter === "all" ? "var(--color-primary)" : "transparent",
          color: filter === "all" ? "#FFFFFF" : "var(--color-muted-foreground)",
          border: "none", borderRadius: 16, cursor: "pointer",
        }}>
          All ({filtered.length})
        </button>
        <button onClick={() => setFilter("escalated")} style={{
          flex: 1, padding: "5px 0", fontSize: 11.5, fontWeight: filter === "escalated" ? 600 : 400,
          background: filter === "escalated" ? "var(--color-destructive)" : "transparent",
          color: filter === "escalated" ? "#FFFFFF" : "var(--color-muted-foreground)",
          border: "none", borderRadius: 16, cursor: "pointer",
        }}>
          Escalated ({conversations.filter(c => c.isEscalated).length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && !conversations.length ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader size={16} className="animate-spin" color="var(--color-primary)" /></div>
        ) : !filtered.length ? (
          <div style={{ textAlign: "center", color: "var(--color-muted-foreground)", padding: 40, fontSize: 12.5 }}>
            <MessageSquare size={36} strokeWidth={1} style={{ opacity: 0.25, marginBottom: 8 }} />
            <p>{search ? "No results" : "No conversations yet"}</p>
          </div>
        ) : (
          filtered.map(chat => {
            const last = lastMsg(chat);
            const sel = selected?.id === chat.id;
            return (
              <div key={chat.id} onClick={() => { setSelected(chat); setMobileList(false); }}
                style={{ display: "flex", gap: 12, padding: "11px 14px", cursor: "pointer", borderBottom: "1px solid var(--color-border)", background: sel ? "var(--color-primary-surface)" : "transparent" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: avatarColor(chat.customerPhone), display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 700, fontSize: 12 }}>
                    {avatarLabel(chat.customerPhone)}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: chat.isEscalated ? "var(--color-destructive)" : "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFFFFF" }}>
                    {chat.isEscalated ? <AlertCircle size={7} color="#FFFFFF" /> : <Bot size={7} color="#FFFFFF" />}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtPhone(chat.customerPhone)}</span>
                    <span style={{ fontSize: 10, color: "var(--color-muted-foreground)", flexShrink: 0, marginLeft: 6 }}>{last ? ago(last.timestamp) : ""}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--color-muted-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{last ? last.content : "No messages yet"}</span>
                  <div style={{ display: "flex", gap: 4, marginTop: 3, alignItems: "center" }}>
                    <span style={{ fontSize: 9.5, fontWeight: 600, padding: "1px 6px", borderRadius: 8, background: chat.isEscalated ? "var(--color-destructive-surface)" : "var(--color-primary-surface)", color: chat.isEscalated ? "var(--color-destructive)" : "var(--color-primary-text)" }}>
                      {chat.isEscalated ? "Manual" : "AI Auto"}
                    </span>
                    {!chat.isEscalated && <span style={{ fontSize: 9.5, color: "var(--color-muted-foreground)" }}>{Math.round(chat.aiConfidenceScore * 100)}%</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ padding: "6px 14px", borderTop: "1px solid var(--color-border)", background: "var(--color-muted)", fontSize: 9.5, color: "var(--color-muted-foreground)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{conversations.length} conversations</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Smartphone size={9} /> WhatsApp</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flex: 1, height: "calc(100vh - 64px)", overflow: "hidden", position: "relative" }}>
      {error && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, background: "var(--color-destructive-surface)", borderBottom: "1px solid rgba(239,68,68,0.2)", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--color-destructive)" }}>
          <AlertCircle size={13} />
          <span>{error}</span>
          <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--color-destructive)", cursor: "pointer", fontSize: 15 }}>&times;</button>
        </div>
      )}

      <div className={`c-sidebar ${mobileList ? "show" : ""}`} style={{ width: 350, borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {sidebar}
      </div>

      <div className={`c-main ${!mobileList ? "show" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {chatView ? chatView : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--color-background)", gap: 8, color: "var(--color-muted-foreground)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-primary-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={32} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-foreground)" }}>Select a conversation</h3>
            <p style={{ fontSize: 12, textAlign: "center", maxWidth: 220, lineHeight: 1.5, color: "var(--color-muted-foreground)" }}>Choose a chat from the sidebar to view messages.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .c-sidebar { width: 100% !important; position: absolute !important; top: 0; left: 0; right: 0; bottom: 0; z-index: 10; display: none !important; }
          .c-sidebar.show { display: flex !important; }
          .c-main { width: 100% !important; position: absolute !important; top: 0; left: 0; right: 0; bottom: 0; display: none !important; }
          .c-main.show { display: flex !important; }
          .chat-back { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
