"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  MessageSquare,
  AlertCircle,
  Loader,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  QrCode,
  ShoppingBag,
  Cpu,
  Smartphone,
} from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const resetTokenUrl = searchParams.get("reset") || "";
  const [authMode, setAuthMode] = useState(mode === "register" ? "register" : "login");
  const [showForgot, setShowForgot] = useState(!!resetTokenUrl);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [resetToken, setResetToken] = useState(resetTokenUrl);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // Shared
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPassError, setLoginPassError] = useState("");
  const [loginEmailTouched, setLoginEmailTouched] = useState(false);
  const [loginPassTouched, setLoginPassTouched] = useState(false);

  // Register fields
  const [regStep, setRegStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [bizError, setBizError] = useState("");
  const [passError, setPassError] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [bizTouched, setBizTouched] = useState(false);
  const [passTouched, setPassTouched] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");

  // Onboarding steps (after registration)
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [paymentPolicy, setPaymentPolicy] = useState("");
  const [productsList, setProductsList] = useState<{ name: string; price: string; sizes: string; details: string; imageUrl: string }[]>([]);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdSizes, setNewProdSizes] = useState("");
  const [newProdDetails, setNewProdDetails] = useState("");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [newProdImageFile, setNewProdImageFile] = useState<File | null>(null);
  const [newProdImagePreview, setNewProdImagePreview] = useState("");
  const [productAdded, setProductAdded] = useState(false);
  const [faqList, setFaqList] = useState<{ question: string; answer: string }[]>([
    { question: "How long does delivery take?", answer: "Delivery takes 1-2 working days in Lagos, and 3-5 days outside Lagos." },
  ]);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [qrScanning, setQrScanning] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  const toggleMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setRegStep(1);
    setShowForgot(false);
    setError("");
  };

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { setError("Enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message || "Something went wrong."); setLoading(false); return; }
      setForgotSent(true);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  // Reset password handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !newPasswordConfirm) { setError("Fill in all fields."); return; }
    if (newPassword !== newPasswordConfirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message || "Something went wrong."); setLoading(false); return; }
      setShowForgot(false);
      setError("Password reset successfully. Sign in with your new password.");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !businessName || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password) || password.length < 8) {
      setError("Please meet all password requirements.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, businessName, password }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error?.message || "Registration failed.");
        setLoading(false);
        return;
      }
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (loginResult?.error) {
        setError("Account created but auto-login failed. Please proceed to login manually.");
        setLoading(false);
      } else {
        setStep(2);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessInfo = () => setStep(3);
  const handleProductsDone = () => setStep(4);

  const addProductToOnboarding = async () => {
    if (!newProdName || !newProdPrice) return;
    const imageUrl = newProdImagePreview || newProdImageUrl;
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: newProdName,
          description: newProdDetails || "High quality fashion item uploaded during onboarding.",
          price: Math.round(parseFloat(newProdPrice) * 100),
          imageUrl: imageUrl || undefined,
          colorOptions: ["Default"],
          sizeOptions: newProdSizes ? newProdSizes.split(",").map((s) => s.trim()) : ["Standard"],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to sync product to DB:", err);
        return;
      }
      setProductsList((prev) => [
        ...prev,
        { name: newProdName, price: newProdPrice, sizes: newProdSizes || "Standard", details: newProdDetails, imageUrl },
      ]);
    } catch (e) {
      console.error("Failed to sync onboarding product to DB:", e);
      return;
    }
    setNewProdName("");
    setNewProdPrice("");
    setNewProdSizes("");
    setNewProdDetails("");
    setNewProdImageUrl("");
    setNewProdImageFile(null);
    setNewProdImagePreview("");
    setProductAdded(true);
  };

  const deleteProduct = (index: number) => {
    setProductsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addFaqToOnboarding = async () => {
    if (!newFaqQuestion || !newFaqAnswer) return;
    setFaqList((prev) => [...prev, { question: newFaqQuestion, answer: newFaqAnswer }]);
    try {
      await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newFaqQuestion, answer: newFaqAnswer }),
      });
    } catch (e) {
      console.error("Failed to sync onboarding FAQ to DB:", e);
    }
    setNewFaqQuestion("");
    setNewFaqAnswer("");
  };

  const deleteFaq = (index: number) => {
    setFaqList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSimulateQRScan = () => {
    setQrScanning(true);
    setTimeout(() => {
      setQrScanning(false);
      setWhatsappConnected(true);
      setTimeout(() => setStep(6), 1200);
    }, 2500);
  };

  if (step > 1 && step <= 4) {
    const onboardStep = step - 1;
    const stepIcons = [<ShoppingBag key="1" size={14} />, <Cpu key="2" size={14} />, <Smartphone key="3" size={14} />];
    const stepLabels = ["Business Info", "Products & AI", "WhatsApp & Launch"];
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-background)" }}>
        <header
          style={{
            height: "64px",
            borderBottom: "var(--border-default)",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 var(--space-6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <MessageSquare size={20} color="var(--color-primary)" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-bold)", fontSize: "var(--size-h2)" }}>
              SalesMate
            </span>
          </div>
          <div style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>
            Step {onboardStep} of 3
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-6)", gap: "var(--space-10)" }}>
          {/* Step Indicator - outside form */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {[1, 2, 3].map((s, idx) => (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div
                    onClick={() => { if (s < onboardStep) setStep(s + 1); }}
                    style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      backgroundColor: s <= onboardStep ? "var(--color-primary)" : "var(--color-muted)",
                      color: s <= onboardStep ? "#FFFFFF" : "var(--color-muted-foreground)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: "bold", cursor: s < onboardStep ? "pointer" : "default",
                      transition: "all 0.3s ease",
                      boxShadow: s === onboardStep ? "0 0 0 4px rgba(37,211,102,0.2)" : "none",
                      transform: s === onboardStep ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {s < onboardStep ? <CheckCircle2 size={18} /> : stepIcons[s - 1]}
                  </div>
                  <span style={{ fontSize: "11px", color: s <= onboardStep ? "var(--color-foreground)" : "var(--color-muted-foreground)", fontWeight: s === onboardStep ? "bold" : "normal", textAlign: "center" }}>
                    {stepLabels[s - 1]}
                  </span>
                </div>
                {idx < 2 && (
                  <div style={{ width: "48px", height: 0, borderTop: "2px dashed", borderColor: s <= onboardStep ? "var(--color-primary)" : "var(--color-border)", margin: "0 var(--space-2)", alignSelf: "center", marginBottom: "18px" }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ width: "100%", maxWidth: step === 2 ? "500px" : "720px", background: "#FFFFFF", borderRadius: "var(--radius-xl)", padding: "var(--space-6)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* STEP 1: BUSINESS INFO */}
            {step === 2 && (
              <div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--space-6)" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary-surface)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
                    <ShoppingBag size={24} color="var(--color-primary-text)" />
                  </div>
                  <h2 style={{ fontSize: "var(--size-h1)", marginBottom: "6px" }}>Tell us about your business</h2>
                  <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)", textAlign: "center", maxWidth: "380px" }}>
                    This information trains the AI agent on how to respond to delivery and payment questions
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div>
                    <label style={{ fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "bold", color: "var(--color-foreground)", display: "block", marginBottom: "4px" }}>Business description</label>
                    <textarea placeholder="e.g. We sell premium ladies ready-to-wear silk wrap dresses..." className="input-field" style={{ height: "80px", resize: "none" }} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                    <div>
                      <label style={{ fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "bold", color: "var(--color-foreground)", display: "block", marginBottom: "4px" }}>Delivery options & pricing</label>
                      <input type="text" placeholder="e.g. ₦1,500 within Lagos. ₦2,500 outside Lagos." className="input-field" value={deliveryDetails} onChange={(e) => setDeliveryDetails(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "bold", color: "var(--color-foreground)", display: "block", marginBottom: "4px" }}>Payment options</label>
                      <input type="text" placeholder="e.g. Bank transfers to GTBank Account: 0123456789" className="input-field" value={paymentPolicy} onChange={(e) => setPaymentPolicy(e.target.value)} />
                    </div>
                    </div>
                    <button className="btn-primary" style={{ width: "100%", padding: "12px", marginTop: "var(--space-2)" }} onClick={handleSaveBusinessInfo}>Continue</button>
                  <button type="button" onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontSize: "var(--size-caption)", cursor: "pointer", textDecoration: "none", width: "100%", textAlign: "center", marginTop: "var(--space-2)", padding: 0 }}>
                    Skip for now, I'll do this later
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PRODUCTS & AI */}
            {step === 3 && (
              <div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--space-6)" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary-surface)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
                    <Cpu size={24} color="var(--color-primary-text)" />
                  </div>
                  <h2 style={{ fontSize: "var(--size-h1)", marginBottom: "6px" }}>Products & AI Training</h2>
                  <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)", textAlign: "center", maxWidth: "480px" }}>
                    Add your products now. After setup, you can add FAQs from your dashboard to teach SalesMate how to respond to common customer questions.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "var(--space-4)" }}>
                  <span style={{ fontSize: "var(--size-micro)", fontWeight: "bold", textTransform: "none", color: "var(--color-muted-foreground)" }}>
                    Products ({productsList.length})
                  </span>
                  {productsList.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--color-background)", border: "var(--border-default)", borderRadius: "var(--radius-lg)" }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", objectFit: "cover" }} /> : <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", background: "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--color-muted-foreground)" }}>No img</div>}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: "var(--size-body)" }}>{p.name}</div>
                        {p.details && <div style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", marginTop: "2px" }}>{p.details}</div>}
                        <div style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>₦{parseFloat(p.price).toLocaleString()} | Sizes: {p.sizes}</div>
                      </div>
                      {!productAdded && <button onClick={() => deleteProduct(idx)} style={{ background: "none", border: "none", color: "var(--color-destructive)", cursor: "pointer" }}><Trash2 size={16} /></button>}
                    </div>
                  ))}
                </div>

                {!productAdded && (
                  <div style={{ border: "1px dashed rgba(0,0,0,0.15)", borderRadius: "var(--radius-xl)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "var(--space-4)", marginBottom: "var(--space-3)" }}>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: "var(--space-3)" }}>
                        <input type="text" placeholder="Product name" className="input-field" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} />
                        <input type="text" placeholder="Product details (optional)" className="input-field" value={newProdDetails} onChange={(e) => setNewProdDetails(e.target.value)} />
                        <input type="number" placeholder="Price in Naira" className="input-field" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} />
                        <input type="text" placeholder="Sizes (e.g. Size 10, 12, 14)" className="input-field" value={newProdSizes} onChange={(e) => setNewProdSizes(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", height: "100%", minHeight: "240px", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-xl)", cursor: "pointer", background: newProdImagePreview ? "transparent" : "var(--color-background)", overflow: "hidden", position: "relative", transition: "all 0.3s ease" }}>
                          {newProdImagePreview ? (
                            <>
                              <img src={newProdImagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                              <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "#FFFFFF", fontSize: "10px", textAlign: "center", padding: "4px", borderRadius: "4px" }}>Change image</div>
                            </>
                          ) : (
                            <>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-foreground)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                              <span style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>Upload image</span>
                            </>
                          )}
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) { setNewProdImageFile(file); const reader = new FileReader(); reader.onload = (ev) => setNewProdImagePreview(ev.target?.result as string); reader.readAsDataURL(file); } }} />
                        </label>
                      </div>
                    </div>
                    <button className="btn-secondary" style={{ width: "100%", padding: "10px", marginTop: "var(--space-4)" }} onClick={addProductToOnboarding}><Plus size={14} /> Add Product</button>
                  </div>
                )}

                <div style={{ textAlign: "center", marginTop: "var(--space-6)" }}>
                  <button className="btn-primary" style={{ padding: "12px 32px", opacity: productAdded ? 1 : 0.5, cursor: productAdded ? "pointer" : "not-allowed" }} disabled={!productAdded} onClick={handleProductsDone}>Continue to setup</button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
                  <button type="button" onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 0" }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button type="button" onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontSize: "var(--size-caption)", cursor: "pointer", textDecoration: "none", padding: 0 }}>
                    Skip for now, I'll do this later
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: WHATSAPP & LAUNCH */}
            {step === 4 && (
              <div>
                {!whatsappConnected ? (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--space-6)" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary-surface)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
                        <Smartphone size={24} color="var(--color-primary-text)" />
                      </div>
                      <h2 style={{ fontSize: "var(--size-h1)", marginBottom: "6px" }}>Connect WhatsApp</h2>
                      <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)", textAlign: "center", maxWidth: "380px" }}>
                        Scan the WhatsApp Business API pairing code to link your phone number
                      </p>
                    </div>
                    <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
                      {qrScanning ? (
                        <div style={{ height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)" }}>
                          <Loader size={36} className="animate-spin" color="var(--color-primary)" />
                          <span style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>Verifying pairing token...</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
                          <div style={{ padding: "16px", border: "var(--border-default)", borderRadius: "var(--radius-xl)", background: "#F9FAFB", display: "inline-block", animation: "pulse 2s infinite" }}>
                            <QrCode size={140} color="#000" />
                          </div>
                          <button className="btn-dark" onClick={handleSimulateQRScan} style={{ width: "100%", maxWidth: "260px" }}>I have scanned this code</button>
                        </div>
                      )}
                    </div>
                    {!qrScanning && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-3)" }}>
                        <button className="btn-secondary" style={{ padding: "12px 24px" }} onClick={() => setStep(3)}>Back</button>
                        <button type="button" onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontSize: "var(--size-caption)", cursor: "pointer", textDecoration: "none", padding: 0 }}>
                          Skip for now, I'll do this later
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-full)", background: "var(--color-primary-surface)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-4)" }}>
                      <CheckCircle2 size={36} color="var(--color-primary)" />
                    </div>
                    <h2 style={{ fontSize: "var(--size-h1)", marginBottom: "8px" }}>You're all set!</h2>
                    <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", lineHeight: "1.5", marginBottom: "var(--space-6)", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
                      Your AI sales agent is live and ready to represent your brand on WhatsApp.
                    </p>
                    <div style={{ textAlign: "left", background: "var(--color-background)", border: "var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-4)", fontSize: "11px", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "var(--space-6)" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}><CheckCircle2 size={14} color="var(--color-primary)" /> Business profile saved</div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}><CheckCircle2 size={14} color="var(--color-primary)" /> Products indexed to database</div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}><CheckCircle2 size={14} color="var(--color-primary)" /> AI trained with your FAQs</div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}><CheckCircle2 size={14} color="var(--color-primary)" /> WhatsApp {whatsappConnected ? "connected" : "configured"}</div>
                    </div>
                    <button className="btn-primary" style={{ width: "100%", padding: "12px" }} onClick={() => router.push("/dashboard")}>Launch Dashboard</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Login / Register forms
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-6)", backgroundColor: "var(--color-background)" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "var(--color-background)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)",  }}>
        {error && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", padding: "var(--space-3)", textAlign: "center", background: error.includes("successfully") ? "var(--color-primary-surface)" : "var(--color-destructive-surface)", border: error.includes("successfully") ? "var(--border-success)" : "var(--border-error)", borderRadius: "var(--radius-lg)", color: error.includes("successfully") ? "var(--color-primary-text)" : "var(--color-destructive)", fontSize: "var(--size-caption)", marginBottom: "var(--space-4)" }}>
            <span>{error}</span>
          </div>
        )}
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: authMode === "register" ? "var(--space-8)" : "var(--space-6)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
            <MessageSquare size={24} color="#FFFFFF" />
          </div>
          {authMode === "login" ? (
            <>
              <h1 style={{ fontSize: "var(--size-h1)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-2)" }}>Welcome back</h1>
              <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>
                Sign in to manage your WhatsApp AI sales representative
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: "var(--size-h1)", marginBottom: "8px" }}>Create your account</h1>
              <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)" }}>
                First step to getting your 24/7 AI sales rep up and running
              </p>
            </>
          )}
        </div>

        {/* LOGIN / FORGOT / RESET */}
        {authMode === "login" && !showForgot && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "normal", color: "var(--color-muted-foreground)", marginBottom: "var(--space-1)" }}>
                Email Address
              </label>
              <input type="email" placeholder="name@example.com" className="input-field" value={loginEmail} onBlur={() => { setLoginEmailTouched(true); if (loginEmail.length === 0) setLoginEmailError("This field cannot be empty"); }} onChange={(e) => { setLoginEmail(e.target.value); const v = e.target.value; if (v.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setLoginEmailError("Enter a valid email address"); } else { setLoginEmailError(""); } }} disabled={loading} required style={{ backgroundColor: loginEmailTouched ? "var(--color-muted)" : "#FFFFFF", ...(loginEmailError ? { borderColor: "var(--color-destructive)" } : {}) }} />
              {loginEmailError && <span style={{ color: "var(--color-destructive)", fontSize: "var(--size-micro)", marginTop: "4px", display: "block" }}>{loginEmailError}</span>}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-1)" }}>
                <label style={{ fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "normal", color: "var(--color-muted-foreground)" }}>
                  Password
                </label>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontSize: "var(--size-micro)", cursor: "pointer", padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <input type="password" placeholder="••••••••" className="input-field" value={loginPassword} onBlur={() => { setLoginPassTouched(true); if (loginPassword.length === 0) setLoginPassError("This field cannot be empty"); }} onChange={(e) => { setLoginPassword(e.target.value); setLoginPassError(""); }} disabled={loading} required style={{ backgroundColor: loginPassTouched ? "var(--color-muted)" : "#FFFFFF", ...(loginPassError ? { borderColor: "var(--color-destructive)" } : {}) }} />
              {loginPassError && <span style={{ color: "var(--color-destructive)", fontSize: "var(--size-micro)", marginTop: "4px", display: "block" }}>{loginPassError}</span>}
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", marginTop: "var(--space-2)" }} disabled={loading}>
              {loading ? <Loader size={18} className="animate-spin" /> : "Sign In"}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {authMode === "login" && showForgot && !forgotSent && !resetToken && (
          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: "var(--color-destructive-surface)", border: "var(--border-error)", borderRadius: "var(--radius-lg)", color: "var(--color-destructive)", fontSize: "var(--size-caption)" }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", lineHeight: "1.4" }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label style={{ display: "block", fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "normal", color: "var(--color-muted-foreground)", marginBottom: "var(--space-1)" }}>
                Email Address
              </label>
              <input type="email" placeholder="name@example.com" className="input-field" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }} disabled={loading}>
              {loading ? <Loader size={18} className="animate-spin" /> : "Send Reset Link"}
            </button>
            <button type="button" onClick={() => { setShowForgot(false); setError(""); }} style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontSize: "var(--size-caption)", cursor: "pointer", padding: 0 }}>
              Back to sign in
            </button>
          </form>
        )}

        {/* FORGOT SENT */}
        {authMode === "login" && forgotSent && (
          <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-full)", background: "var(--color-primary-surface)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h3 style={{ fontSize: "var(--size-h2)", marginBottom: "4px" }}>Check your email</h3>
            <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", lineHeight: "1.4" }}>
              We've sent a password reset link to <strong>{forgotEmail}</strong>
            </p>
            <button type="button" onClick={() => { setShowForgot(false); setForgotSent(false); setError(""); }} style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontSize: "var(--size-caption)", cursor: "pointer", marginTop: "var(--space-4)", padding: 0 }}>
              Back to sign in
            </button>
          </div>
        )}

        {/* RESET PASSWORD */}
        {authMode === "login" && resetToken && !forgotSent && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: error.includes("successfully") ? "var(--color-primary-surface)" : "var(--color-destructive-surface)", border: error.includes("successfully") ? "var(--border-success)" : "var(--border-error)", borderRadius: "var(--radius-lg)", color: error.includes("successfully") ? "var(--color-primary-text)" : "var(--color-destructive)", fontSize: "var(--size-caption)" }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)", lineHeight: "1.4" }}>
              Enter your new password below.
            </p>
            <div>
              <label style={{ display: "block", fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "normal", color: "var(--color-muted-foreground)", marginBottom: "var(--space-1)" }}>
                New Password
              </label>
              <input type="password" placeholder="••••••••" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--size-micro)", textTransform: "none", fontWeight: "normal", color: "var(--color-muted-foreground)", marginBottom: "var(--space-1)" }}>
                Confirm Password
              </label>
              <input type="password" placeholder="••••••••" className="input-field" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }} disabled={loading}>
              {loading ? <Loader size={18} className="animate-spin" /> : "Reset Password"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authMode === "register" && (
          <div>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: "var(--color-destructive-surface)", border: "var(--border-error)", borderRadius: "var(--radius-lg)", color: "var(--color-destructive)", fontSize: "var(--size-caption)", marginBottom: "var(--space-4)" }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {regStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <label style={{ fontSize: "var(--size-micro)", textTransform: "none", color: "var(--color-muted-foreground)", display: "block", marginBottom: "4px" }}>
                    Enter Fullname
                  </label>
                  <input type="text" placeholder="Adeola Johnson" className="input-field" value={fullName} onBlur={() => { setNameTouched(true); if (fullName.length === 0) setNameError("This field cannot be empty"); }} onChange={(e) => { setFullName(e.target.value); if (e.target.value.length > 0 && e.target.value.length < 2) { setNameError("Fullname must be at least 2 characters"); } else { setNameError(""); } }} required autoFocus style={{ backgroundColor: nameTouched ? "var(--color-muted)" : "#FFFFFF", ...(nameError ? { borderColor: "var(--color-destructive)" } : {}) }} />
                  {nameError && <span style={{ color: "var(--color-destructive)", fontSize: "var(--size-micro)", marginTop: "4px", display: "block" }}>{nameError}</span>}
                </div>
                <div>
                  <label style={{ fontSize: "var(--size-micro)", textTransform: "none", color: "var(--color-muted-foreground)", display: "block", marginBottom: "4px" }}>
                    Enter Email
                  </label>
                  <input type="email" placeholder="adeola@fashionhouse.com" className="input-field" value={email} onBlur={() => setEmailTouched(true)} onChange={(e) => { setEmail(e.target.value); const v = e.target.value; if (v.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setEmailError("Enter a valid email address"); } else { setEmailError(""); } }} required style={{ backgroundColor: emailTouched ? "var(--color-muted)" : "#FFFFFF", ...(emailError ? { borderColor: "var(--color-destructive)" } : {}) }} />
                  {emailError && <span style={{ color: "var(--color-destructive)", fontSize: "var(--size-micro)", marginTop: "4px", display: "block" }}>{emailError}</span>}
                </div>
                <button type="button" className="btn-primary" style={{ padding: "12px", width: "100%", marginTop: "var(--space-3)" }} onClick={() => {
                  setNameError("");
                  setEmailError("");
                  let hasError = false;
                  if (!fullName && !email) { setNameError("Field cannot be empty"); setEmailError("Field cannot be empty"); hasError = true; }
                  else { if (!fullName) { setNameError("Field cannot be empty"); hasError = true; } if (!email) { setEmailError("Field cannot be empty"); hasError = true; } }
                  if (hasError) return;
                  setRegStep(2);
                }}>
                  Continue
                </button>
              </div>
            )}
            {regStep === 2 && (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <label style={{ fontSize: "var(--size-micro)", textTransform: "none", color: "var(--color-muted-foreground)", display: "block", marginBottom: "4px" }}>
                    Business Name
                  </label>
                  <input type="text" placeholder="Adeola Fashion House" className="input-field" value={businessName} onBlur={() => { setBizTouched(true); if (businessName.length === 0) setBizError("This field cannot be empty"); }} onChange={(e) => { setBusinessName(e.target.value); setBizError(""); }} required style={{ backgroundColor: bizTouched ? "var(--color-muted)" : "#FFFFFF", ...(bizError ? { borderColor: "var(--color-destructive)" } : {}) }} />
                  {bizError && <span style={{ color: "var(--color-destructive)", fontSize: "var(--size-micro)", marginTop: "4px", display: "block" }}>{bizError}</span>}
                </div>
                <div>
                  <label style={{ fontSize: "var(--size-micro)", textTransform: "none", color: "var(--color-muted-foreground)", display: "block", marginBottom: "4px" }}>
                    Password
                  </label>
                  <input type="password" placeholder="••••••••" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setPassTouched(true)} required style={{ backgroundColor: passTouched ? "var(--color-muted)" : "#FFFFFF" }} />
                  {password.length > 0 && (
                    <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
                      {!/[A-Z]/.test(password) ? (
                        <span style={{ fontSize: "var(--size-micro)", color: "var(--color-destructive)" }}>Must contain an uppercase letter</span>
                      ) : !/[a-z]/.test(password) ? (
                        <span style={{ fontSize: "var(--size-micro)", color: "var(--color-destructive)" }}>Must contain a lowercase letter</span>
                      ) : !/[0-9]/.test(password) ? (
                        <span style={{ fontSize: "var(--size-micro)", color: "var(--color-destructive)" }}>Must contain a number</span>
                      ) : !/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                        <span style={{ fontSize: "var(--size-micro)", color: "var(--color-destructive)" }}>Must contain a special character</span>
                      ) : password.length < 8 ? (
                        <span style={{ fontSize: "var(--size-micro)", color: "var(--color-destructive)" }}>Must contain at least 8 characters</span>
                      ) : null}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "12px", width: "100%", marginTop: "var(--space-3)" }} disabled={loading}>
                  {loading ? <Loader size={18} className="animate-spin" /> : "Continue Setup"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        {!showForgot && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-5)" }}>
            {authMode === "register" && regStep === 1 ? (
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-muted-foreground)", fontSize: "var(--size-caption)", textDecoration: "none" }}>
                <ArrowLeft size={14} /> Back to home
              </Link>
            ) : authMode === "register" && regStep === 2 ? (
              <button type="button" onClick={() => setRegStep(1)} style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontSize: "var(--size-caption)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", padding: "0" }}>
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={toggleMode}
              style={{ background: "none", border: "none", color: "var(--color-primary-text)", fontWeight: "normal", fontSize: "var(--size-caption)", cursor: "pointer" }}
            >
              {authMode === "login" ? "Don't have an account? Sign up" : "Already registered? Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader size={24} className="animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
