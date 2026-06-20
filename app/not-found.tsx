import React from "react";
import Link from "next/link";
import { MessageSquare, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        backgroundColor: "var(--color-background)",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          border: "var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-6)",
          textAlign: "center",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-xl)",
            backgroundColor: "var(--color-primary-surface)",
            color: "var(--color-primary-text)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <h1 style={{ fontSize: "var(--size-h1)", fontWeight: "bold", color: "var(--color-foreground)" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)", marginTop: "8px", lineHeight: "1.4" }}>
          The link you requested does not exist or may have moved. Verify your dashboard credentials and try again.
        </p>

        <hr style={{ border: 0, borderTop: "var(--border-default)", margin: "var(--space-5) 0" }} />

        <Link href="/dashboard" className="btn-primary" style={{ width: "100%" }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
