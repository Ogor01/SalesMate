import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  MessageSquare,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatNaira } from "@/lib/constants";

export default async function OverviewPage({ userId }: { userId: string }) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { fullName: true, businessName: true },
  });

  const dbConversationsCount = await db.conversation.count({ where: { userId } });
  const dbLeadsCount = await db.lead.count({ where: { userId } });
  const dbProductsCount = await db.product.count({ where: { userId } });

  const escalatedChats = await db.conversation.findMany({
    where: { userId, isEscalated: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalConvs = dbConversationsCount;
  const totalLeads = dbLeadsCount;
  const convRate = totalConvs > 0 ? ((totalLeads / totalConvs) * 100).toFixed(1) : "0";
  const aiHandled = dbConversationsCount > 0 ? Math.round(dbConversationsCount * 0.87) : 0;

  const chartPoints = "0,140 100,120 200,135 300,90 400,60 500,80 600,30 700,45 800,20";
  const chartFillPoints = "0,140 100,120 200,135 300,90 400,60 500,80 600,30 700,45 800,20 800,180 0,180";

  return (
    <div className="dashboard-content"
      style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-6)", overflowY: "auto", height: "100vh" }}
    >
      <div className="dashboard-header">
        <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)" }}>
          Welcome back, {user?.fullName.split(" ")[0] || "Adeola"}
        </h1>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>
          Here's your AI agent overview for {user?.businessName || "your boutique"}.
        </p>
      </div>

      <div className="dashboard-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
        <KPICard title="Total Conversations" icon={<MessageSquare size={16} />} value={totalConvs.toLocaleString()} subtitle="All messages handled by your AI agent" />
        <KPICard title="Leads Captured" icon={<Users size={16} />} value={totalLeads} subtitle="Qualified buyers identified from chats" />
        <KPICard title="Conversion Rate" icon={<TrendingUp size={16} />} value={`${convRate}%`} subtitle="Percentage of conversations that convert" />
        <KPICard title="Products" icon={<Sparkles size={16} />} value={dbProductsCount} subtitle="Items in your catalog" />
      </div>

      <div className="dashboard-charts-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "var(--space-5)" }}>
        <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <div>
              <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold" }}>Conversation Volume</h3>
              <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>AI replies handled vs human takeover</p>
            </div>
            <span style={{ fontSize: "var(--size-label)", color: "var(--color-primary-text)", fontWeight: "bold" }}>Active Listening Live</span>
          </div>
          <div style={{ height: "180px", width: "100%" }}>
            <svg viewBox="0 0 800 180" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <line x1="0" y1="45" x2="800" y2="45" stroke="#F1F3F6" strokeWidth="1" />
              <line x1="0" y1="90" x2="800" y2="90" stroke="#F1F3F6" strokeWidth="1" />
              <line x1="0" y1="135" x2="800" y2="135" stroke="#F1F3F6" strokeWidth="1" />
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25D366" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={chartFillPoints} fill="url(#chartGlow)" />
              <polyline fill="none" stroke="var(--color-primary)" strokeWidth="3" points={chartPoints} />
              <circle cx="800" cy="20" r="4" fill="var(--color-primary)" />
            </svg>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>Takeover Alerts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {escalatedChats.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)", textAlign: "center", padding: "var(--space-4) 0", gap: "8px" }}>
                <CheckCircle2Icon color="var(--color-primary)" size={24} />
                <span>All clear! No pending escalation alerts.</span>
              </div>
            ) : (
              escalatedChats.map((chat) => (
                <div key={chat.id} style={{ padding: "10px", border: "var(--border-error)", background: "var(--color-destructive-surface)", borderRadius: "var(--radius-lg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--size-body-sm)", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>{chat.customerPhone}</span>
                    <span style={{ fontSize: "var(--size-micro)", color: "var(--color-destructive)", fontWeight: "bold" }}>Score: {Math.round(chat.aiConfidenceScore * 100)}%</span>
                  </div>
                  <Link href="/conversations" style={{ fontSize: "var(--size-caption)", color: "var(--color-destructive)", fontWeight: "bold", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px", marginTop: "2px" }}>
                    Takeover Chat <ChevronRight size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>
          Recent Activity Logs
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--size-body-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "var(--border-default)", textAlign: "left", color: "var(--color-muted-foreground)" }}>
                <th style={{ padding: "8px 0", fontWeight: "var(--weight-semibold)" }}>Event</th>
                <th style={{ padding: "8px 0", fontWeight: "var(--weight-semibold)" }}>Target Phone</th>
                <th style={{ padding: "8px 0", fontWeight: "var(--weight-semibold)" }}>Status</th>
                <th style={{ padding: "8px 0", fontWeight: "var(--weight-semibold)", textAlign: "right" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {dbConversationsCount === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "var(--space-6) 0", textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>
                    No activity yet. Activity will appear here once customers start chatting.
                  </td>
                </tr>
              ) : (
                <tr style={{ borderBottom: "var(--border-default)" }}>
                  <td style={{ padding: "10px 0" }}>Database loaded</td>
                  <td style={{ padding: "10px 0" }}>System</td>
                  <td style={{ padding: "10px 0" }}>
                    <span style={{ color: "var(--color-primary-text)", background: "var(--color-primary-surface)", padding: "2px 6px", borderRadius: "var(--radius-md)" }}>OK</span>
                  </td>
                  <td style={{ padding: "10px 0", textAlign: "right", color: "var(--color-muted-foreground)" }}>Active</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2Icon({ color, size }: { color: string; size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function KPICard({ title, icon, value, subtitle }: { title: string; icon: React.ReactNode; value: string | number; subtitle: string }) {
  return (
    <div style={{ background: "#FFFFFF", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", border: "var(--border-default)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted-foreground)" }}>
        <span style={{ fontSize: "var(--size-label)", fontWeight: "bold", textTransform: "uppercase" }}>{title}</span>
        {icon}
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>{value}</div>
      <div style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>{subtitle}</div>
    </div>
  );
}