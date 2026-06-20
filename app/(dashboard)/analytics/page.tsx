import React from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, MessageSquare, TrendingUp, Users } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/login");

  const dbConversationsCount = await db.conversation.count({ where: { userId } });
  const dbLeadsCount = await db.lead.count({ where: { userId } });

  return (
    <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-6)", overflowY: "auto", height: "100vh" }}>
      <div>
        <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)" }}>Analytics</h1>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>
          Performance metrics and insights for your AI sales agent.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
        <div style={{ background: "#FFFFFF", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", border: "var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted-foreground)" }}>
            <span style={{ fontSize: "var(--size-label)", fontWeight: "bold", textTransform: "uppercase" }}>Total Conversations</span>
            <MessageSquare size={16} />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>{dbConversationsCount}</div>
        </div>
        <div style={{ background: "#FFFFFF", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", border: "var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted-foreground)" }}>
            <span style={{ fontSize: "var(--size-label)", fontWeight: "bold", textTransform: "uppercase" }}>Leads Captured</span>
            <Users size={16} />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>{dbLeadsCount}</div>
        </div>
        <div style={{ background: "#FFFFFF", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", border: "var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted-foreground)" }}>
            <span style={{ fontSize: "var(--size-label)", fontWeight: "bold", textTransform: "uppercase" }}>Conversion Rate</span>
            <TrendingUp size={16} />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>{dbConversationsCount > 0 ? ((dbLeadsCount / dbConversationsCount) * 100).toFixed(1) : "0"}%</div>
        </div>
      </div>

      {dbConversationsCount === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-10)", background: "#FFFFFF", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-xl)", textAlign: "center", flexDirection: "column", gap: "var(--space-3)" }}>
          <BarChart3 size={40} strokeWidth={1} color="var(--color-muted-foreground)" />
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>
            Analytics data will appear here once your AI agent starts handling conversations.
          </p>
        </div>
      ) : (
        <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "var(--space-3)" }}>Conversation Trends</h3>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>Detailed analytics charts will be available in a future update.</p>
        </div>
      )}
    </div>
  );
}
