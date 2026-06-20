"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Smartphone,
  Save,
  CheckCircle,
  Loader,
  AlertCircle,
  Link2,
  QrCode,
} from "lucide-react";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // WhatsApp connection credentials state
  const [phoneId, setPhoneId] = useState("");
  const [token, setToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("SM_VERIFY_TOKEN_123");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // In real app, load profile and WhatsApp configuration from API.
    // For MVP, set standard mock defaults which update in state on save.
    setBusinessName("Adeola Ready-to-Wear");
    setFullName("Adeola Johnson");
    setEmail("adeola@fashionhouse.com");
    setPhoneId("102947109283719");
    setToken("EAAGyB76sZAg0BA...");
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    setTimeout(() => {
      setLoading(false);
      setSuccess("Profile settings updated successfully!");
    }, 600);
  };

  const handleSaveWhatsAppConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!phoneId || !token) {
      setError("Please fill in both Phone Number ID and Access Token.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess("WhatsApp Cloud API configuration saved! Webhook is live.");
    }, 800);
  };

  return (
    <div
      style={{
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)", color: "var(--color-foreground)" }}>
          Settings
        </h1>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>
          Manage your account profile and configure Meta developer access tokens.
        </p>
      </div>

      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3)",
            background: "var(--color-primary-surface)",
            border: "var(--border-success)",
            borderRadius: "var(--radius-lg)",
            color: "var(--color-primary-text)",
            fontSize: "var(--size-caption)",
            maxWidth: "600px",
          }}
        >
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3)",
            background: "var(--color-destructive-surface)",
            border: "var(--border-error)",
            borderRadius: "var(--radius-lg)",
            color: "var(--color-destructive)",
            fontSize: "var(--size-caption)",
            maxWidth: "600px",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        {/* Profile Card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "var(--border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-5)",
          }}
        >
          <h2 style={{ fontSize: "var(--size-h2)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>
            Business Profile
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "var(--size-micro)", textTransform: "uppercase", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                Business Name
              </label>
              <input
                type="text"
                className="input-field"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "var(--size-micro)", textTransform: "uppercase", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                Vendor Representative Name
              </label>
              <input
                type="text"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "var(--size-micro)", textTransform: "uppercase", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                Notification Email
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "fit-content", marginTop: "var(--space-3)" }} disabled={loading}>
              <Save size={16} /> Save Profile Changes
            </button>
          </form>
        </div>

        {/* WhatsApp Setup Card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "var(--border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-2)" }}>
            <Smartphone size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: "var(--size-h2)", fontWeight: "bold" }}>
              WhatsApp Integration Credentials
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "var(--space-3)", padding: "8px 12px", background: "var(--color-primary-surface)", borderRadius: "var(--radius-lg)", fontSize: "var(--size-caption)", color: "var(--color-primary-text)" }}>
            <CheckCircle size={14} />
            <span>Device paired during onboarding</span>
            <span style={{ fontSize: "10px", color: "var(--color-muted-foreground)", marginLeft: "auto" }}>Connected</span>
          </div>
          <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", marginBottom: "var(--space-4)", lineHeight: "1.4" }}>
            The QR code you scanned during onboarding paired your WhatsApp device. To enable automatic messaging, enter your Meta WhatsApp Cloud API credentials below. These can be found in the <strong style={{ color: "var(--color-foreground)" }}>Meta Developer Portal</strong>.
          </p>

          <details style={{ marginBottom: "var(--space-4)" }}>
            <summary style={{ fontSize: "var(--size-caption)", color: "var(--color-primary-text)", cursor: "pointer", userSelect: "none" }}>
              Show pairing QR code
            </summary>
            <div style={{ textAlign: "center", padding: "var(--space-4)", marginTop: "var(--space-3)", background: "#F9FAFB", borderRadius: "var(--radius-xl)", border: "var(--border-default)" }}>
              <QrCode size={140} color="#000" />
              <p style={{ fontSize: "10px", color: "var(--color-muted-foreground)", marginTop: "8px" }}>Scan this code from WhatsApp to pair your device</p>
            </div>
          </details>

          <form onSubmit={handleSaveWhatsAppConfig} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "var(--size-micro)", textTransform: "uppercase", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                Phone Number ID (Meta Graph API)
              </label>
              <input
                type="text"
                placeholder="e.g. 1092471928..."
                className="input-field"
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "var(--size-micro)", textTransform: "uppercase", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                System User Access Token (Meta API Token)
              </label>
              <input
                type="password"
                placeholder="EAAGyB76sZAg..."
                className="input-field"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "var(--size-micro)", textTransform: "uppercase", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                Webhook Verification Token (Verify Handshake)
              </label>
              <input
                type="text"
                className="input-field"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                background: "var(--color-background)",
                border: "var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "10px",
                fontSize: "11px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                color: "var(--color-muted-foreground)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-primary-text)" }}>
                <Link2 size={12} /> Webhook URL Target Endpoint (Meta Developer Panel)
              </div>
              <div style={{ fontFamily: "var(--font-mono)", background: "#FFFFFF", padding: "4px", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "4px", userSelect: "all" }}>
                https://salesmate.vercel.app/api/whatsapp/webhook
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "fit-content", marginTop: "var(--space-3)" }} disabled={loading}>
              {loading ? <Loader size={16} className="animate-spin" /> : "Link WhatsApp API"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
