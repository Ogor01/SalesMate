"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen, Plus, Loader, AlertCircle, HelpCircle, CheckCircle,
} from "lucide-react";

interface FAQ { id: string; question: string; answer: string; }

export default function KnowledgeBasePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"faqs" | "delivery" | "payment" | "returns">("faqs");
  const [deliveryDetails, setDeliveryDetails] = useState("₦1,500 within Lagos. ₦2,500 outside Lagos. Nationwide delivery takes 3-5 days via GIG Logistics.");
  const [paymentDetails, setPaymentDetails] = useState("We accept online payment cards and direct bank transfers. GTBank Account 0123456789 (Adeola Boutique Ltd).");
  const [returnDetails, setReturnDetails] = useState("We accept returns within 48 hours of delivery only for items with manufacturing defects. Store credit equivalents.");
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faqs");
      const json = await res.json();
      if (res.ok) setFaqs(json.data || []);
      else setError(json.error?.message || "Failed to load FAQs.");
    } catch { setError("Network error loading FAQ list."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchFaqs();
    fetch("/api/business/profile").then((r) => r.json()).then((json) => {
      const d = json.data || json;
      if (d.deliveryPolicy) setDeliveryDetails(d.deliveryPolicy);
      if (d.paymentPolicy) setPaymentDetails(d.paymentPolicy);
      if (d.returnPolicy) setReturnDetails(d.returnPolicy);
    }).catch(() => {});
  }, []);

  const handleSavePolicies = async () => {
    setSubmitting(true); setSuccessMsg(""); setError("");
    try {
      const res = await fetch("/api/business/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryPolicy: deliveryDetails,
          paymentPolicy: paymentDetails,
          returnPolicy: returnDetails,
        }),
      });
      if (res.ok) {
        setSuccessMsg("Store policies saved and updated in AI training prompt successfully!");
      } else {
        const json = await res.json();
        setError(json.error?.message || "Failed to save policies.");
      }
    } catch {
      setError("Network error saving policies.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;
    setSubmitting(true); setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/faqs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });
      const json = await res.json();
      if (res.ok) {
        setFaqs((prev) => [json.data, ...prev]);
        setShowAddFaq(false); setNewQuestion(""); setNewAnswer("");
        setSuccessMsg("New FAQ pair added and indexed to AI context successfully!");
      } else setError(json.error?.message || "Failed to save FAQ.");
    } catch { setError("Network error saving FAQ pair."); }
    finally { setSubmitting(false); }
  };

  const tabs = [
    { key: "faqs" as const, label: "Frequently Asked Questions" },
    { key: "delivery" as const, label: "Delivery & Shipping" },
    { key: "payment" as const, label: "Payment Policy" },
    { key: "returns" as const, label: "Returns & Refunds" },
  ];

  return (
    <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)", overflowY: "auto", height: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)" }}>AI Knowledge Base</h1>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>Configure policies and FAQs to train your AI sales rep.</p>
        </div>
        {activeTab === "faqs" && <button className="btn-primary" onClick={() => setShowAddFaq(true)}><Plus size={16} /> Add FAQ</button>}
      </div>

      <div style={{ display: "flex", gap: "6px", borderBottom: "var(--border-default)", paddingBottom: "8px" }}>
        {tabs.map((t) => (
          <button key={t.key} className="btn-secondary" style={{ border: "none", borderRadius: "var(--radius-md)", fontSize: "12px", padding: "8px 16px", background: activeTab === t.key ? "var(--color-primary-surface)" : "transparent", color: activeTab === t.key ? "var(--color-primary-text)" : "var(--color-muted-foreground)", fontWeight: activeTab === t.key ? "bold" : "normal" }} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <AlertBanner type="error" message={error} />}
      {successMsg && <AlertBanner type="success" message={successMsg} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeTab === "faqs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Loader size={24} className="animate-spin" color="var(--color-primary)" /></div>
            ) : faqs.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-8)", textAlign: "center", color: "var(--color-muted-foreground)" }}>
                <HelpCircle size={36} strokeWidth={1} style={{ marginBottom: "var(--space-2)" }} />
                <h3>No custom FAQs yet</h3>
                <button className="btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => setShowAddFaq(true)}>+ Add First FAQ</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {faqs.map((faq) => (
                  <div key={faq.id} style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-4)" }}>
                    <div style={{ display: "flex", gap: "8px", fontWeight: "bold", fontSize: "var(--size-body-sm)" }}><span style={{ color: "var(--color-primary-text)" }}>Q:</span><span>{faq.question}</span></div>
                    <div style={{ display: "flex", gap: "8px", fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", marginTop: "6px", paddingLeft: "18px" }}><span>{faq.answer}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab !== "faqs" && (
          <div style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: "600px" }}>
            {activeTab === "delivery" && <PolicyEditor title="Delivery Policy Details" value={deliveryDetails} onChange={setDeliveryDetails} />}
            {activeTab === "payment" && <PolicyEditor title="Payment Method Guidelines" value={paymentDetails} onChange={setPaymentDetails} />}
            {activeTab === "returns" && <PolicyEditor title="Return & Refund Window" value={returnDetails} onChange={setReturnDetails} />}
            <button className="btn-primary" onClick={handleSavePolicies} disabled={submitting} style={{ width: "fit-content", alignSelf: "flex-end" }}>
              {submitting ? <Loader size={16} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {showAddFaq && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#FFFFFF", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "460px", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ fontSize: "var(--size-h1)", fontWeight: "bold" }}>Add custom FAQ pair</h2>
            <form onSubmit={handleAddFaq} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <input type="text" placeholder="e.g. Do you deliver outside Lagos?" className="input-field" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} required />
              <textarea placeholder="e.g. Yes! We ship nationwide using DHL." className="input-field" style={{ height: "100px", resize: "none" }} value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} required />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "var(--space-4)" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddFaq(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? <Loader size={16} className="animate-spin" /> : "Index FAQ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertBanner({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: isError ? "var(--color-destructive-surface)" : "var(--color-primary-surface)", border: isError ? "var(--border-error)" : "var(--border-success)", borderRadius: "var(--radius-lg)", color: isError ? "var(--color-destructive)" : "var(--color-primary-text)", fontSize: "var(--size-caption)" }}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      <span>{message}</span>
    </div>
  );
}

function PolicyEditor({ title, value, onChange }: { title: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "8px" }}>{title}</h3>
      <textarea className="input-field" style={{ height: "120px", resize: "none" }} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}