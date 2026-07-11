"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Package,
  Cpu,
  Users,
  TrendingUp,
  Zap,
  Check,
  ArrowRight,
  Menu,
  X,
  Play,
  RotateCcw,
  Star,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive WhatsApp Chat Simulator State
  const [chatStep, setChatStep] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { role: "customer", text: "Hi, do you have the ankara set in size L? 👗", time: "10:42 AM" },
  ]);

  const simulateNextChatStep = () => {
    if (chatStep === 0) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Yes! 🎉 We have the Premium Ankara Set in size L — available in Navy Blue, Burgundy & Forest Green. It's ₦45,000.\n\nWhich colour do you love? 😊",
          time: "10:42 AM",
        },
      ]);
      setChatStep(1);
    } else if (chatStep === 1) {
      setChatMessages((prev) => [
        ...prev,
        { role: "customer", text: "Burgundy please! How do I pay? 💳", time: "10:43 AM" },
      ]);
      setChatStep(2);
    } else if (chatStep === 2) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "We accept bank transfer & Opay 🏦\nZenith Bank - 1234567890\nAdaeze Fashion Hub Ltd\n\nSend receipt & I'll confirm instantly! ✅",
          time: "10:43 AM",
        },
      ]);
      setChatStep(3);
    }
  };

  const resetChat = () => {
    setChatMessages([
      { role: "customer", text: "Hi, do you have the ankara set in size L? 👗", time: "10:42 AM" },
    ]);
    setChatStep(0);
  };

  return (
    <div className="landing-container">
      {/* FIXED NAVIGATION */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-6)",
          zIndex: 100,
          background: "rgba(10, 13, 20, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "var(--border-sidebar)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: "var(--weight-bold)",
              color: "#FFFFFF",
              letterSpacing: "-0.2px"
            }}
          >
            SalesMate AI
          </span>
        </div>

        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={{ border: "none", background: "none", color: "#FFFFFF", cursor: "pointer" }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="nav-desktop" style={{ display: "flex", gap: "24px" }}>
          <a
            href="#features"
            style={{
              color: "var(--color-muted-foreground)",
              textDecoration: "none",
              fontSize: "var(--size-body)",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-muted-foreground)")}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            style={{
              color: "var(--color-muted-foreground)",
              textDecoration: "none",
              fontSize: "var(--size-body)",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-muted-foreground)")}
          >
            How it works
          </a>
          <a
            href="#pricing"
            style={{
              color: "var(--color-muted-foreground)",
              textDecoration: "none",
              fontSize: "var(--size-body)",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-muted-foreground)")}
          >
            Pricing
          </a>
        </nav>

        <div className="header-cta" style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
          <Link
            href="/auth?mode=login"
            style={{
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "var(--size-body)",
              fontWeight: "var(--weight-medium)",
            }}
          >
            Log in
          </Link>
          <Link href="/auth?mode=register" className="btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>
            Start free <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
        <hr style={{ width: "40px", border: "0.5px solid rgba(255,255,255,0.1)", margin: "var(--space-4) 0" }} />
        <Link href="/auth?mode=login" style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "1.2rem" }} onClick={() => setMobileMenuOpen(false)}>
          Log in
        </Link>
        <Link href="/auth?mode=register" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>
          Start free
        </Link>
      </div>

      {/* SECTION 1: HERO */}
      <section className="landing-section dark-theme" id="hero" style={{ minHeight: "100vh", backgroundColor: "#0A0D14", display: "flex", alignItems: "center", paddingTop: "100px", paddingBottom: "60px" }}>
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "350px",
            height: "350px",
            borderRadius: "var(--radius-full)",
            background: "rgba(37, 211, 102, 0.06)",
            filter: "blur(90px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div
          className="responsive-grid-hero"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            padding: "0 var(--space-6)",
            zIndex: 1,
          }}
        >
          {/* Left Column */}
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                background: "rgba(37, 211, 102, 0.1)",
                border: "1px solid rgba(37, 211, 102, 0.15)",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: "var(--weight-semibold)",
                marginBottom: "24px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#25D366", display: "inline-block" }}></span>
              Now live — 500+ fashion vendors
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw + 0.5rem, 3.8rem)",
                lineHeight: "1.15",
                marginBottom: "var(--space-4)",
                letterSpacing: "-0.8px",
                color: "#FFFFFF",
              }}
            >
              Your AI sales rep <br />
              <span style={{ color: "var(--color-primary)" }}>on WhatsApp,</span> <br />
              working 24/7.
            </h1>

            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "clamp(0.9rem, 1.2vw + 0.5rem, 1.15rem)",
                lineHeight: "1.6",
                marginBottom: "var(--space-8)",
                maxWidth: "520px",
              }}
            >
              Stop replying to the same questions all day. SalesMate AI handles customer inquiries, recommends products, captures leads, and closes sales — while you sleep.
            </p>

            <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "flex-start", width: "100%" }}>
              <Link href="/auth?mode=register" className="btn-primary" style={{ padding: "14px 28px", fontSize: "14px", borderRadius: "30px" }}>
                Start for free <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-secondary" style={{ padding: "14px 28px", fontSize: "14px", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.15)", borderRadius: "30px", background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(8px)" }}>
                See demo
              </a>
            </div>

            {/* Micro Badges */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-6)",
                marginTop: "36px",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "12px",
              }}
              className="micro-badges"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={14} color="var(--color-primary)" /> No coding needed
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={14} color="var(--color-primary)" /> Set up in 10 minutes
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={14} color="var(--color-primary)" /> Free 14-day trial
              </div>
            </div>
          </div>

          {/* Right Column: Interactive WhatsApp chat demo with floating badges */}
          <div
            className="chat-simulator"
            style={{
              position: "relative",
              justifySelf: "center",
              width: "100%",
              maxWidth: "360px",
              borderRadius: "28px",
              padding: "12px",
              background: "#080B11",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Floating Badge Left: Response time */}
            <div
              className="floating-badge"
              style={{
                position: "absolute",
                left: "-35px",
                top: "15%",
              }}
            >
              <span className="floating-badge-label">Response time</span>
              <span className="floating-badge-value" style={{ color: "#10B981" }}>1.8s</span>
            </div>

            {/* Floating Badge Right: Conversion rate */}
            <div
              className="floating-badge"
              style={{
                position: "absolute",
                right: "-25px",
                bottom: "35%",
              }}
            >
              <span className="floating-badge-label">Conversion rate</span>
              <span className="floating-badge-value" style={{ color: "#10B981" }}>22%</span>
            </div>

            {/* Phone Speaker & Camera notches */}
            <div
              style={{
                width: "90px",
                height: "18px",
                background: "#000",
                borderRadius: "var(--radius-full)",
                margin: "0 auto 10px auto",
              }}
            />

            {/* Chat Mockup Screen */}
            <div
              style={{
                height: "440px",
                borderRadius: "20px",
                background: "#F0F2F5",
                backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                backgroundSize: "contain",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                color: "#000000",
                position: "relative",
              }}
            >
              {/* WhatsApp Header */}
              <div
                style={{
                  background: "#075E54",
                  padding: "12px 14px",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      color: "#075E54",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#075E54" strokeWidth="2.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>Adaeze Fashion Hub</div>
                    <div style={{ fontSize: "10px", opacity: 0.85, display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4ADE80", display: "inline-block" }}></span>
                      AI Agent • Online
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div
                style={{
                  flex: 1,
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  overflowY: "auto",
                  fontSize: "12px",
                }}
              >
                {chatMessages.map((msg, index) => {
                  const isCustomer = msg.role === "customer";
                  return (
                    <div
                      key={index}
                      style={{
                        alignSelf: isCustomer ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        background: isCustomer ? "#E1FFC7" : "#FFFFFF",
                        padding: "8px 12px",
                        borderRadius: isCustomer ? "12px 0 12px 12px" : "0 12px 12px 12px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        position: "relative",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text.split("\n").map((line, lidx) => (
                        <p key={lidx} style={{ margin: "2px 0", lineHeight: "1.4" }}>{line}</p>
                      ))}
                      <div
                        style={{
                          fontSize: "8px",
                          color: "gray",
                          textAlign: "right",
                          marginTop: "4px",
                        }}
                      >
                        {msg.time}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Controller Panel */}
              <div
                style={{
                  background: "#F0F2F5",
                  padding: "10px",
                  borderTop: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                {chatStep < 3 ? (
                  <button
                    onClick={simulateNextChatStep}
                    style={{
                      flex: 1,
                      background: "var(--color-primary)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-primary-dark)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
                  >
                    <Play size={12} fill="#FFFFFF" /> Send Customer Reply
                  </button>
                ) : (
                  <button
                    onClick={resetChat}
                    style={{
                      flex: 1,
                      background: "#374151",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <RotateCcw size={12} /> Reset Conversation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
          }}
        >
          <ChevronDown size={20} className="animate-pulse" style={{ animation: "pulse 2s infinite" }} />
        </div>
      </section>

      {/* SECTION 2: METRICS STRIP */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid rgba(0,0,0,0.04)", borderBottom: "1px solid rgba(0,0,0,0.04)", padding: "40px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 var(--space-6)" }}>
          <div
            className="responsive-grid-4"
            style={{
              gap: "var(--space-6)",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "clamp(1.8rem, 3vw + 0.5rem, 2.5rem)", fontWeight: "800", color: "var(--color-foreground)", letterSpacing: "-0.5px" }}>500+</div>
              <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "4px", fontWeight: "500" }}>Fashion vendors</div>
            </div>
            <div>
              <div style={{ fontSize: "clamp(1.8rem, 3vw + 0.5rem, 2.5rem)", fontWeight: "800", color: "var(--color-foreground)", letterSpacing: "-0.5px" }}>2M+</div>
              <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "4px", fontWeight: "500" }}>Messages handled</div>
            </div>
            <div>
              <div style={{ fontSize: "clamp(1.8rem, 3vw + 0.5rem, 2.5rem)", fontWeight: "800", color: "var(--color-foreground)", letterSpacing: "-0.5px" }}>94%</div>
              <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "4px", fontWeight: "500" }}>AI resolution rate</div>
            </div>
            <div>
              <div style={{ fontSize: "clamp(1.8rem, 3vw + 0.5rem, 2.5rem)", fontWeight: "800", color: "var(--color-foreground)", letterSpacing: "-0.5px" }}>22%</div>
              <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "4px", fontWeight: "500" }}>Avg conversion lift</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section className="landing-section" id="features" style={{ backgroundColor: "#F7F8FA" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 var(--space-6)" }}>
          {/* FEATURES GRID HEADER */}
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary-text)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              FEATURES
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw + 0.5rem, 2.2rem)", color: "var(--color-foreground)", letterSpacing: "-0.5px", fontWeight: "800" }}>
              Everything you need to sell more on WhatsApp
            </h2>
          </div>

          <div
            className="responsive-grid-3"
            style={{
              gap: "24px",
            }}
          >
            {/* Feature Card 1 */}
            <div
              className="feature-card"
              style={{
                padding: "30px",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "rgba(37, 211, 102, 0.08)",
                  color: "var(--color-primary-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-foreground)", marginBottom: "10px" }}>Instant AI replies</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Customers get answers in under 2 seconds — prices, sizes, availability, delivery. No more leaving people on read.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div
              className="feature-card"
              style={{
                padding: "30px",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#F1F3F6",
                  color: "var(--color-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Package size={20} color="var(--color-foreground)" />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-foreground)", marginBottom: "10px" }}>Smart product catalog</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Upload your products once. The AI learns every detail — colours, sizes, prices — and answers questions accurately.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div
              className="feature-card"
              style={{
                padding: "30px",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#F1F3F6",
                  color: "var(--color-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Cpu size={20} color="var(--color-foreground)" />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-foreground)", marginBottom: "10px" }}>Trained on your business</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Feed it your FAQs, delivery zones, payment methods and return policy. It speaks exactly like your brand.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div
              className="feature-card"
              style={{
                padding: "30px",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#F1F3F6",
                  color: "var(--color-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Users size={20} color="var(--color-foreground)" />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-foreground)", marginBottom: "10px" }}>Lead capture & tracking</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Every interested customer is logged automatically — name, number, what they asked. Your pipeline fills itself.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div
              className="feature-card"
              style={{
                padding: "30px",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#F1F3F6",
                  color: "var(--color-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <TrendingUp size={20} color="var(--color-foreground)" />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-foreground)", marginBottom: "10px" }}>Conversion analytics</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                See which products get the most questions, which leads convert, and where customers drop off.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div
              className="feature-card"
              style={{
                padding: "30px",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#F1F3F6",
                  color: "var(--color-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Zap size={20} color="var(--color-foreground)" />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-foreground)", marginBottom: "10px" }}>Human handoff</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                When the AI isn't confident, it alerts you instantly and steps aside so you can jump in seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="landing-section dark-theme" id="how-it-works" style={{ backgroundColor: "#0F1117" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 var(--space-6)" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw + 0.5rem, 2.2rem)", color: "#FFFFFF", letterSpacing: "-0.5px", fontWeight: "800" }}>
              Set up in under 10 minutes
            </h2>
          </div>

          <div
            className="responsive-grid-4"
            style={{
              gap: "24px",
            }}
          >
            {/* Step 1 */}
            <div style={{ padding: "16px var(--space-4)", borderLeft: "2px solid var(--color-primary)" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-primary)", marginBottom: "8px" }}>
                01
              </div>
              <h3 style={{ fontSize: "15px", color: "#FFFFFF", marginBottom: "8px", fontWeight: "700" }}>Upload your products</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Add your catalog — photos, prices, sizes, colours. Takes about 5 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ padding: "16px var(--space-4)", borderLeft: "2px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
                02
              </div>
              <h3 style={{ fontSize: "15px", color: "#FFFFFF", marginBottom: "8px", fontWeight: "700" }}>Train your AI</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Tell it your delivery zones, payment methods, FAQs and return policy.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ padding: "16px var(--space-4)", borderLeft: "2px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
                03
              </div>
              <h3 style={{ fontSize: "15px", color: "#FFFFFF", marginBottom: "8px", fontWeight: "700" }}>Connect WhatsApp</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Scan a QR code to link your WhatsApp Business number. One-click activation.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ padding: "16px var(--space-4)", borderLeft: "2px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
                04
              </div>
              <h3 style={{ fontSize: "15px", color: "#FFFFFF", marginBottom: "8px", fontWeight: "700" }}>Watch sales happen</h3>
              <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                Your AI handles customer conversations 24/7 while you track results on your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TESTIMONIALS */}
      <section className="landing-section" id="testimonials" style={{ backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 var(--space-6)" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary-text)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              TESTIMONIALS
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw + 0.5rem, 2.2rem)", color: "var(--color-foreground)", letterSpacing: "-0.5px", fontWeight: "800" }}>
              Fashion sellers love SalesMate
            </h2>
          </div>

          <div className="responsive-grid-3" style={{ gap: "24px" }}>
            {/* Testimonial Card 1 */}
            <div className="testimonial-card">
              <div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} color="#10B981" fill="#10B981" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "I used to spend 4 hours a day replying to WhatsApp messages. Now SalesMate handles everything and I just check my leads in the morning. My sales went up 30% in the first month."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="testimonial-avatar" style={{ background: "#E8F5E9", color: "#15803D" }}>
                  CO
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-foreground)" }}>Chidinma Okonkwo</div>
                  <div style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}>Owner, Chidi Couture Lagos</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="testimonial-card">
              <div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} color="#10B981" fill="#10B981" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "My customers don't even know it's an AI. The replies are so fast and accurate. I've converted leads I would have lost at 2am because the bot replied instantly."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="testimonial-avatar" style={{ background: "#E8F5E9", color: "#15803D" }}>
                  FA
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-foreground)" }}>Fatima Al-Hassan</div>
                  <div style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}>Ankara & Lace Vendor, Abuja</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="testimonial-card">
              <div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} color="#10B981" fill="#10B981" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "Setup took me literally 8 minutes. I uploaded my products, added my bank details and connected WhatsApp. That's it. It's been running for 3 weeks without me touching it."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="testimonial-avatar" style={{ background: "#E8F5E9", color: "#15803D" }}>
                  BN
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-foreground)" }}>Blessing Nwosu</div>
                  <div style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}>Instagram Fashion Seller</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PRICING */}
      <section className="landing-section" id="pricing" style={{ backgroundColor: "#F7F8FA" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 var(--space-6)" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary-text)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              PRICING
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw + 0.5rem, 2.2rem)", color: "var(--color-foreground)", letterSpacing: "-0.5px", fontWeight: "800", marginBottom: "12px" }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "14px", fontWeight: "500" }}>
              14-day free trial on all plans. No credit card required.
            </p>
          </div>

          {/* Plan Cards Grid */}
          <div
            className="responsive-grid-3"
            style={{
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            {/* Starter Plan */}
            <div
              className="pricing-card"
              style={{
                background: "#FFFFFF",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Starter
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px", margin: "16px 0" }}>
                  <span style={{ fontSize: "clamp(1.8rem, 2.5vw + 0.5rem, 2.4rem)", fontWeight: "800", color: "var(--color-foreground)" }}>₦9,900</span>
                  <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>/month</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginBottom: "20px", lineHeight: "1.4" }}>
                  Perfect for solo vendors just getting started.
                </p>
                <hr style={{ border: 0, borderTop: "var(--border-default)", marginBottom: "20px" }} />
                <ul style={{ listStyle: "none", fontSize: "12px", display: "flex", flexDirection: "column", gap: "12px", color: "var(--color-foreground)" }}>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> 500 AI conversations/month</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Up to 20 products</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Lead capture</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> WhatsApp connection</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Email support</li>
                </ul>
              </div>
              <Link href="/auth?mode=register" className="btn-dark" style={{ marginTop: "30px", fontSize: "13px", padding: "12px 24px", borderRadius: "8px" }}>
                Start free trial
              </Link>
            </div>

            {/* Growth Plan: Most popular */}
            <div
              className="pricing-card-recommended"
              style={{
                background: "#0F1117",
                color: "#FFFFFF",
                border: "2px solid var(--color-primary)",
                borderRadius: "var(--radius-xl)",
                padding: "30px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: "scale(1.03)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  padding: "4px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "9px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Most popular
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Growth
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px", margin: "16px 0" }}>
                  <span style={{ fontSize: "clamp(1.8rem, 2.5vw + 0.5rem, 2.4rem)", fontWeight: "800", color: "#FFFFFF" }}>₦24,900</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>/month</span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "20px", lineHeight: "1.4" }}>
                  For vendors serious about scaling their sales.
                </p>
                <hr style={{ border: 0, borderTop: "var(--border-sidebar)", marginBottom: "20px" }} />
                <ul style={{ listStyle: "none", fontSize: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Unlimited conversations</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Unlimited products</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Advanced analytics</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Human handoff alerts</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Priority support</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Custom AI persona</li>
                </ul>
              </div>
              <Link href="/auth?mode=register" className="btn-primary" style={{ marginTop: "30px", fontSize: "13px", padding: "12px 24px", borderRadius: "8px" }}>
                Start free trial
              </Link>
            </div>

            {/* Business Plan */}
            <div
              className="pricing-card"
              style={{
                background: "#FFFFFF",
                border: "var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Business
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px", margin: "16px 0" }}>
                  <span style={{ fontSize: "clamp(1.8rem, 2.5vw + 0.5rem, 2.4rem)", fontWeight: "800", color: "var(--color-foreground)" }}>₦59,900</span>
                  <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>/month</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginBottom: "20px", lineHeight: "1.4" }}>
                  For boutiques and brands with a team.
                </p>
                <hr style={{ border: 0, borderTop: "var(--border-default)", marginBottom: "20px" }} />
                <ul style={{ listStyle: "none", fontSize: "12px", display: "flex", flexDirection: "column", gap: "12px", color: "var(--color-foreground)" }}>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Everything in Growth</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Multiple WhatsApp numbers</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Team access (3 seats)</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> API access</li>
                  <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><Check size={14} color="var(--color-primary)" /> Dedicated account manager</li>
                </ul>
              </div>
              <Link href="/auth?mode=register" className="btn-dark" style={{ marginTop: "30px", fontSize: "13px", padding: "12px 24px", borderRadius: "8px" }}>
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA SECTION */}
      <section className="landing-section dark-theme" id="cta-section" style={{ backgroundColor: "#0A0D14", textAlign: "center", padding: "100px 0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", padding: "0 var(--space-6)" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.2rem)", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-1px", lineHeight: "1.2", marginBottom: "20px" }}>
            Ready to let AI sell <br />
            <span style={{ color: "var(--color-primary)" }}>while you rest?</span>
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "16px", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto 40px auto" }}>
            Join 500+ fashion vendors across Nigeria who are converting WhatsApp messages into sales automatically.
          </p>
          <Link href="/auth?mode=register" className="btn-primary" style={{ padding: "16px 40px", fontSize: "15px", borderRadius: "30px", display: "inline-flex" }}>
            Start your free 14-day trial <ArrowRight size={18} />
          </Link>
          <div style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px", marginTop: "16px", fontWeight: "500" }}>
            No credit card required · Cancel anytime
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#0A0D14", borderTop: "1px solid rgba(255, 255, 255, 0.05)", padding: "40px 0", color: "rgba(255, 255, 255, 0.4)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 var(--space-6)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#FFFFFF" }}>SalesMate AI</span>
          </div>

          {/* Copyright */}
          <div style={{ fontSize: "12px" }}>
            © 2026 SalesMate AI. Built for Nigerian fashion sellers.
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "20px", fontSize: "12px" }}>
            <a href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }} onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>Privacy</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }} onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>Terms</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }} onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
