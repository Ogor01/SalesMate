"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Loader,
  AlertCircle,
  HelpCircle,
  Trash2,
  CheckCircle,
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function KnowledgeBasePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"faqs" | "delivery" | "payment" | "returns">("faqs");

  // Onboarding configs (mocked from business profile inputs for simplicity in MVP)
  const [deliveryDetails, setDeliveryDetails] = useState("₦1,500 within Lagos. ₦2,500 outside Lagos. Nationwide delivery takes 3-5 days via GIG Logistics.");
  const [paymentDetails, setPaymentDetails] = useState("We accept online payment cards and direct bank transfers. Bank transfer details: GTBank Account 0123456789 (Adeola Boutique Ltd).");
  const [returnDetails, setReturnDetails] = useState("We accept returns within 48 hours of delivery only for items with manufacturing defects. No cash refunds; we offer store credit equivalents.");

  // Modal State
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faqs");
      const json = await res.json();
      if (res.ok) {
        setFaqs(json.data || []);
      } else {
        setError(json.error?.message || "Failed to load FAQs.");
      }
    } catch (err) {
      setError("Network error loading FAQ list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSavePolicies = () => {
    setSubmitting(true);
    setSuccessMsg("");
    setError("");
    
    // Simulate updating merchant business profile
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg("Store policies saved and updated in AI training prompt successfully!");
    }, 800);
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });

      const json = await res.json();

      if (res.ok) {
        setFaqs((prev) => [json.data, ...prev]);
        setShowAddFaq(false);
        setNewQuestion("");
        setNewAnswer("");
        setSuccessMsg("New FAQ pair added and indexed to AI context successfully!");
      } else {
        setError(json.error?.message || "Failed to save FAQ.");
      }
    } catch (err) {
      setError("Network error saving FAQ pair.");
    } finally {
      setSubmitting(false);
    }
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
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)", color: "var(--color-foreground)" }}>
            AI Knowledge Base
          </h1>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>
            Configure policies and FAQs to train your AI sales representative on shop guidelines.
          </p>
        </div>
        {activeTab === "faqs" && (
          <button className="btn-primary" onClick={() => setShowAddFaq(true)}>
            <Plus size={16} /> Add FAQ
          </button>
        )}
      </div>

      {/* Tabs list */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          borderBottom: "var(--border-default)",
          paddingBottom: "8px",
        }}
      >
        <button
          className="btn-secondary"
          style={{
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            padding: "8px 16px",
            background: activeTab === "faqs" ? "var(--color-primary-surface)" : "transparent",
            color: activeTab === "faqs" ? "var(--color-primary-text)" : "var(--color-muted-foreground)",
            fontWeight: activeTab === "faqs" ? "bold" : "normal",
          }}
          onClick={() => setActiveTab("faqs")}
        >
          Frequently Asked Questions
        </button>
        <button
          className="btn-secondary"
          style={{
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            padding: "8px 16px",
            background: activeTab === "delivery" ? "var(--color-primary-surface)" : "transparent",
            color: activeTab === "delivery" ? "var(--color-primary-text)" : "var(--color-muted-foreground)",
            fontWeight: activeTab === "delivery" ? "bold" : "normal",
          }}
          onClick={() => setActiveTab("delivery")}
        >
          Delivery & Shipping
        </button>
        <button
          className="btn-secondary"
          style={{
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            padding: "8px 16px",
            background: activeTab === "payment" ? "var(--color-primary-surface)" : "transparent",
            color: activeTab === "payment" ? "var(--color-primary-text)" : "var(--color-muted-foreground)",
            fontWeight: activeTab === "payment" ? "bold" : "normal",
          }}
          onClick={() => setActiveTab("payment")}
        >
          Payment Policy
        </button>
        <button
          className="btn-secondary"
          style={{
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            padding: "8px 16px",
            background: activeTab === "returns" ? "var(--color-primary-surface)" : "transparent",
            color: activeTab === "returns" ? "var(--color-primary-text)" : "var(--color-muted-foreground)",
            fontWeight: activeTab === "returns" ? "bold" : "normal",
          }}
          onClick={() => setActiveTab("returns")}
        >
          Returns & Refunds
        </button>
      </div>

      {/* Alerts */}
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
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
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
          }}
        >
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Panels */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* FAQS PANEL */}
        {activeTab === "faqs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <Loader size={24} className="animate-spin" color="var(--color-primary)" />
              </div>
            ) : faqs.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#FFFFFF",
                  border: "var(--border-default)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-8)",
                  textAlign: "center",
                  color: "var(--color-muted-foreground)",
                }}
              >
                <HelpCircle size={36} strokeWidth={1} style={{ marginBottom: "var(--space-2)" }} />
                <h3>No custom FAQs yet</h3>
                <p style={{ fontSize: "var(--size-caption)", marginTop: "4px" }}>
                  Write frequently asked questions to train your AI representative on common queries.
                </p>
                <button className="btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => setShowAddFaq(true)}>
                  + Add First FAQ
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    style={{
                      background: "#FFFFFF",
                      border: "var(--border-default)",
                      borderRadius: "var(--radius-xl)",
                      padding: "var(--space-4)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", fontWeight: "bold", fontSize: "var(--size-body-sm)" }}>
                      <span style={{ color: "var(--color-primary-text)" }}>Q:</span>
                      <span>{faq.question}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", marginTop: "6px", paddingLeft: "18px" }}>
                      <span>{faq.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* POLICY PANELS (Delivery, Payment, Returns) */}
        {activeTab !== "faqs" && (
          <div
            style={{
              background: "#FFFFFF",
              border: "var(--border-default)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              maxWidth: "600px",
            }}
          >
            {activeTab === "delivery" && (
              <div>
                <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "8px" }}>
                  Delivery Policy Details
                </h3>
                <textarea
                  className="input-field"
                  style={{ height: "120px", resize: "none" }}
                  value={deliveryDetails}
                  onChange={(e) => setDeliveryDetails(e.target.value)}
                />
              </div>
            )}

            {activeTab === "payment" && (
              <div>
                <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "8px" }}>
                  Payment Method Guidelines
                </h3>
                <textarea
                  className="input-field"
                  style={{ height: "120px", resize: "none" }}
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />
              </div>
            )}

            {activeTab === "returns" && (
              <div>
                <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold", marginBottom: "8px" }}>
                  Return & Refund Window
                </h3>
                <textarea
                  className="input-field"
                  style={{ height: "120px", resize: "none" }}
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                />
              </div>
            )}

            <button className="btn-primary" onClick={handleSavePolicies} disabled={submitting} style={{ width: "fit-content", alignSelf: "flex-end" }}>
              {submitting ? <Loader size={16} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* ADD FAQ MODAL */}
      {showAddFaq && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              width: "100%",
              maxWidth: "460px",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <h2 style={{ fontSize: "var(--size-h1)", fontWeight: "bold" }}>Add custom FAQ pair</h2>
              <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>
                Add questions and answers to ground AI completion context.
              </p>
            </div>

            <form onSubmit={handleAddFaq} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div>
                <label style={{ fontSize: "var(--size-micro)", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                  Question
                </label>
                <input
                  type="text"
                  placeholder="e.g. Do you deliver outside Lagos?"
                  className="input-field"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "var(--size-micro)", display: "block", marginBottom: "4px", color: "var(--color-muted-foreground)" }}>
                  Answer
                </label>
                <textarea
                  placeholder="e.g. Yes! We ship nationwide using DHL or GIG Logistics."
                  className="input-field"
                  style={{ height: "100px", resize: "none" }}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "var(--space-4)" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddFaq(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader size={16} className="animate-spin" /> : "Index FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
