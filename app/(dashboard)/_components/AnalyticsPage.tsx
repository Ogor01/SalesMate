import React from "react";
import { db } from "@/lib/db";
import {
  BarChart3,
  MessageSquare,
  TrendingUp,
  Users,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default async function AnalyticsPage({ userId }: { userId: string }) {
  const [
    conversationsCount,
    leadsCount,
    productsCount,
    escalatedCount,
    leadStatusCounts,
    recentConversations,
    faqsCount,
  ] = await Promise.all([
    db.conversation.count({ where: { userId } }),
    db.lead.count({ where: { userId } }),
    db.product.count({ where: { userId } }),
    db.conversation.count({ where: { userId, isEscalated: true } }),
    db.lead.groupBy({
      by: ["leadStatus"],
      where: { userId },
      _count: { id: true },
    }),
    db.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { createdAt: true, aiConfidenceScore: true },
    }),
    db.fAQ.count({ where: { userId } }),
  ]);

  const avgConfidence =
    recentConversations.length > 0
      ? (
          recentConversations.reduce((sum, c) => sum + c.aiConfidenceScore, 0) /
          recentConversations.length
        ).toFixed(2)
      : "0";

  const handoffRate =
    conversationsCount > 0
      ? ((escalatedCount / conversationsCount) * 100).toFixed(1)
      : "0";

  const statusMap: Record<string, number> = {
    NEW: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    CONVERTED: 0,
    LOST: 0,
  };
  for (const s of leadStatusCounts) {
    statusMap[s.leadStatus] = s._count.id;
  }

  // Group conversations by date (last 14 days)
  const now = new Date();
  const dayMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
  }
  for (const c of recentConversations) {
    const key = new Date(c.createdAt).toISOString().slice(0, 10);
    if (dayMap[key] !== undefined) dayMap[key]++;
  }
  const trendDays = Object.entries(dayMap);
  const maxDayCount = Math.max(...Object.values(dayMap), 1);

  return (
    <div
      style={{
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      <div>
        <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)" }}>
          Analytics
        </h1>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>
          Performance metrics and insights for your AI sales agent.
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
        <KpiCard
          icon={<MessageSquare size={16} />}
          label="Conversations"
          value={conversationsCount}
        />
        <KpiCard
          icon={<Users size={16} />}
          label="Leads Captured"
          value={leadsCount}
        />
        <KpiCard
          icon={<TrendingUp size={16} />}
          label="Conversion"
          value={conversationsCount > 0 ? `${((leadsCount / conversationsCount) * 100).toFixed(1)}%` : "0%"}
        />
        <KpiCard
          icon={<ShoppingBag size={16} />}
          label="Products"
          value={productsCount}
        />
        <KpiCard
          icon={<Sparkles size={16} />}
          label="Avg Confidence"
          value={avgConfidence}
        />
        <KpiCard
          icon={<AlertTriangle size={16} />}
          label="Handoff Rate"
          value={`${handoffRate}%`}
        />
        <KpiCard
          icon={<HelpCircle size={16} />}
          label="FAQs"
          value={faqsCount}
        />
        <KpiCard
          icon={<BarChart3 size={16} />}
          label="Escalated"
          value={escalatedCount}
        />
      </div>

      {/* Lead Status Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>
            Lead Status Breakdown
          </h3>
          {leadsCount === 0 ? (
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>
              No leads captured yet. Data will appear once your AI agent starts qualifying customers.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[
                { key: "NEW", label: "New", color: "#6B7280" },
                { key: "CONTACTED", label: "Contacted", color: "#3B82F6" },
                { key: "QUALIFIED", label: "Qualified", color: "#F59E0B" },
                { key: "CONVERTED", label: "Converted", color: "#10B981" },
                { key: "LOST", label: "Lost", color: "#EF4444" },
              ].map((s) => {
                const count = statusMap[s.key] || 0;
                const pct = leadsCount > 0 ? (count / leadsCount) * 100 : 0;
                return (
                  <div key={s.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--size-caption)", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600 }}>{s.label}</span>
                      <span>
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div style={{ height: "8px", background: "var(--color-border)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: s.color,
                          borderRadius: "var(--radius-full)",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 14-Day Trend */}
        <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>
            14-Day Conversation Trend
          </h3>
          {conversationsCount === 0 ? (
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>
              No conversations yet. Trend data will appear once your AI agent starts handling messages.
            </p>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "140px" }}>
              {trendDays.map(([day, count]) => (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${(count / maxDayCount) * 120}px`,
                      background: "var(--color-primary)",
                      borderRadius: "4px 4px 0 0",
                      opacity: count > 0 ? 1 : 0.3,
                      minHeight: count > 0 ? "4px" : "2px",
                    }}
                  />
                  <span style={{ fontSize: "8px", color: "var(--color-muted-foreground)", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                    {day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-xl)",
        border: "var(--border-default)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted-foreground)" }}>
        <span style={{ fontSize: "var(--size-label)", fontWeight: "bold", textTransform: "uppercase" }}>
          {label}
        </span>
        {icon}
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>{value}</div>
    </div>
  );
}
