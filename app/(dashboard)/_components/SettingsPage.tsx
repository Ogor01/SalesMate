"use client";

import React, { useState, useEffect } from "react";
import { Settings, Smartphone, Save, CheckCircle, Loader, AlertCircle, Link2 } from "lucide-react";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setBusinessName("Adeola Ready-to-Wear");
    setFullName("Adeola Johnson");
    setEmail("adeola@fashionhouse.com");
    setAccountSid("ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    setAuthToken("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    setTwilioPhoneNumber("+14155238886");
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSuccess(""); setError("");
    setTimeout(() => { setLoading(false); setSuccess("Profile settings updated successfully!"); }, 600);
  };

  const handleSaveTwilioConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSuccess(""); setError("");
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      setError("Please fill in all Twilio credentials."); setLoading(false); return;
    }
    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSid, authToken, twilioPhoneNumber }),
      });
      const json = await res.json();
      if (res.ok) setSuccess("Twilio WhatsApp configuration saved! Webhook is live.");
      else setError(json.error?.message || "Failed to save Twilio config.");
    } catch { setError("Network error saving configuration."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)", overflowY: "auto", height: "100vh" }}>
      <div>
        <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)" }}>Settings</h1>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>Manage your account profile and configure Meta developer access tokens.</p>
      </div>

      {success && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: "var(--color-primary-surface)", border: "var(--border-success)", borderRadius: "var(--radius-lg)", color: "var(--color-primary-text)", fontSize: "var(--size-caption)", maxWidth: "600px" }}><CheckCircle size={16} /><span>{success}</span></div>}
      {error && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: "var(--color-destructive-surface)", border: "var(--border-error)", borderRadius: "var(--radius-lg)", color: "var(--color-destructive)", fontSize: "var(--size-caption)", maxWidth: "600px" }}><AlertCircle size={16} /><span>{error}</span></div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
          <h2 style={{ fontSize: "var(--size-h2)", fontWeight: "bold", marginBottom: "var(--space-4)" }}>Business Profile</h2>
          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <input type="text" className="input-field" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" required />
            <input type="text" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Vendor Name" required />
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <button type="submit" className="btn-primary" style={{ width: "fit-content", marginTop: "var(--space-3)" }} disabled={loading}><Save size={16} /> Save Profile</button>
          </form>
        </div>

        <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-2)" }}>
            <Smartphone size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: "var(--size-h2)", fontWeight: "bold" }}>Twilio WhatsApp Integration</h2>
          </div>
          <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", marginBottom: "var(--space-4)", lineHeight: "1.4" }}>
            Enter your Twilio credentials. You need a Twilio account with a WhatsApp-enabled number.
          </p>
          <form onSubmit={handleSaveTwilioConfig} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <input type="text" placeholder="Account SID (AC...)" className="input-field" value={accountSid} onChange={(e) => setAccountSid(e.target.value)} required />
            <input type="password" placeholder="Auth Token" className="input-field" value={authToken} onChange={(e) => setAuthToken(e.target.value)} required />
            <input type="text" placeholder="Twilio WhatsApp Number (e.g. +14155238886)" className="input-field" value={twilioPhoneNumber} onChange={(e) => setTwilioPhoneNumber(e.target.value)} required />
            <div style={{ background: "var(--color-background)", border: "var(--border-default)", borderRadius: "var(--radius-lg)", padding: "10px", fontSize: "11px", color: "var(--color-muted-foreground)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-primary-text)" }}><Link2 size={12} /> Webhook URL</div>
              <div style={{ fontFamily: "var(--font-mono)", background: "#FFFFFF", padding: "4px", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "4px", userSelect: "all", marginTop: "4px" }}>https://salesmate.vercel.app/api/whatsapp/webhook</div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: "fit-content", marginTop: "var(--space-3)" }} disabled={loading}>
              {loading ? <Loader size={16} className="animate-spin" /> : "Save Twilio Config"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}