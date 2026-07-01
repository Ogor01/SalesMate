"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Search, Loader, AlertCircle, ShoppingBag, Sparkles,
  ToggleLeft, ToggleRight, X,
} from "lucide-react";
import { formatNaira } from "@/lib/constants";

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  colorOptions: string[];
  sizeOptions: string[];
  inStock: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "instock" | "outstock">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [colorsStr, setColorsStr] = useState("");
  const [sizesStr, setSizesStr] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data || []);
      } else {
        setError(json.error?.message || "Failed to load products.");
      }
    } catch (err) {
      setError("Network error loading product catalog.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !priceStr) return;
    setSubmitting(true);
    setError("");
    try {
      const priceKobo = Math.round(parseFloat(priceStr) * 100);
      const colorOptions = colorsStr ? colorsStr.split(",").map((c) => c.trim()) : [];
      const sizeOptions = sizesStr ? sizesStr.split(",").map((s) => s.trim()) : [];
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: name,
          description: description || "No description provided.",
          price: priceKobo,
          imageUrl: imagePreview || undefined,
          colorOptions,
          sizeOptions,
          inStock: true,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setProducts((prev) => [json.data, ...prev]);
        setShowAddModal(false);
        setName(""); setDescription(""); setPriceStr(""); setColorsStr(""); setSizesStr("");
        setImageFile(null); setImagePreview("");
      } else {
        setError(json.error?.message || "Failed to add product.");
      }
    } catch (err) {
      setError("Network error adding product.");
    } finally { setSubmitting(false); }
  };

  const handleToggleStock = async (product: Product) => {
    const updatedState = !product.inStock;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, inStock: updatedState } : p)));
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, price: product.price, inStock: updatedState }),
      });
    } catch (e) { console.error("Could not sync stock status:", e); }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || (activeFilter === "instock" && p.inStock) || (activeFilter === "outstock" && !p.inStock);
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)", overflowY: "auto", height: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "var(--size-display)", fontWeight: "var(--weight-bold)" }}>Product Catalog</h1>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "var(--size-body)", marginTop: "4px" }}>Add and manage clothing item stock details.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Product</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)", background: "#FFFFFF", padding: "12px", border: "var(--border-default)", borderRadius: "var(--radius-xl)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
          <Search size={16} color="var(--color-muted-foreground)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search products..." className="input-field" style={{ paddingLeft: "34px", fontSize: "12px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "instock", "outstock"] as const).map((f) => (
            <button key={f} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "11px", background: activeFilter === f ? "var(--color-primary-surface)" : "" }} onClick={() => setActiveFilter(f)}>
              {f === "all" ? "All Items" : f === "instock" ? "In Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: "var(--color-destructive-surface)", border: "var(--border-error)", borderRadius: "var(--radius-lg)", color: "var(--color-destructive)", fontSize: "var(--size-caption)" }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader size={32} className="animate-spin" color="var(--color-primary)" /></div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", border: "2px dashed rgba(0,0,0,0.06)", borderRadius: "var(--radius-xl)", padding: "var(--space-10)", textAlign: "center", color: "var(--color-muted-foreground)" }}>
          <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: "var(--space-3)" }} />
          <h3>No products found</h3>
          <button className="btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => setShowAddModal(true)}>+ Add First Product</button>
        </div>
      ) : (
        <div className="dashboard-products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
          {filteredProducts.map((p) => (
            <div key={p.id} style={{ background: "#FFFFFF", border: "var(--border-default)", borderRadius: "var(--radius-xl)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "180px", background: "#F1F3F6", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-muted-foreground)" }}>
                {p.imageUrl ? <img src={p.imageUrl} alt={p.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ShoppingBag size={36} strokeWidth={1} />}
                <div style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 8px", borderRadius: "var(--radius-md)", fontSize: "8px", fontWeight: "bold", textTransform: "uppercase", color: "#FFFFFF", background: p.inStock ? "var(--color-primary-dark)" : "var(--color-destructive)" }}>
                  {p.inStock ? "In Stock" : "Out of stock"}
                </div>
              </div>
              <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <h3 style={{ fontSize: "var(--size-h3)", fontWeight: "bold" }}>{p.productName}</h3>
                <div style={{ fontSize: "var(--size-mono)", fontWeight: "bold", color: "var(--color-primary-text)" }}>{formatNaira(p.price)}</div>
                <p style={{ fontSize: "var(--size-caption)", color: "var(--color-muted-foreground)" }}>{p.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}>AI Agent Visible</span>
                  <button onClick={() => handleToggleStock(p)} style={{ background: "none", border: "none", color: p.inStock ? "var(--color-primary)" : "var(--color-muted-foreground)", cursor: "pointer", display: "flex" }}>
                    {p.inStock ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#FFFFFF", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "640px", padding: "var(--space-6)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--color-muted-foreground)" }}><X size={18} /></button>
            <h2 style={{ fontSize: "var(--size-h1)", fontWeight: "bold", textAlign: "center", marginBottom: "var(--space-4)" }}>Add new product</h2>
            <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <input type="text" placeholder="Product Name" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                  <textarea placeholder="Product details..." className="input-field" style={{ height: "60px", resize: "none" }} value={description} onChange={(e) => setDescription(e.target.value)} />
                  <input type="number" placeholder="Price in Naira" className="input-field" value={priceStr} onChange={(e) => setPriceStr(e.target.value)} required />
                  <input type="text" placeholder="Sizes (e.g. 10, 12, 14)" className="input-field" value={sizesStr} onChange={(e) => setSizesStr(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", height: "100%", minHeight: "240px", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-xl)", cursor: "pointer", background: imagePreview ? "transparent" : "var(--color-background)", overflow: "hidden", position: "relative" }}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                        <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "#FFFFFF", fontSize: "10px", textAlign: "center", padding: "4px", borderRadius: "4px" }}>Change image</div>
                      </>
                    ) : (
                      <><ShoppingBag size={32} strokeWidth={1} color="var(--color-muted-foreground)" /><span style={{ fontSize: "var(--size-caption)" }}>Upload image</span></>
                    )}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onload = (ev) => setImagePreview(ev.target?.result as string); reader.readAsDataURL(file); } }} />
                  </label>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? <Loader size={16} className="animate-spin" /> : "Save Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}