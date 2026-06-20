"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function SidebarToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    const sidebar = document.getElementById("dashboard-sidebar");
    if (sidebar) {
      sidebar.classList.toggle("open");
      setIsOpen(sidebar.classList.contains("open"));
    }
  };

  const closeSidebar = () => {
    const sidebar = document.getElementById("dashboard-sidebar");
    if (sidebar) {
      sidebar.classList.remove("open");
      setIsOpen(false);
    }
  };

  // Close sidebar automatically on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  return (
    <>
      {/* Overlay */}
      <div className="dashboard-overlay" onClick={closeSidebar} />

      {/* Mobile header */}
      <div className="sidebar-toggle" style={{
        display: "none",
        height: "56px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--space-4)",
        background: "var(--color-sidebar-bg)",
        borderBottom: "var(--border-sidebar)",
        color: "#FFFFFF",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={14} color="#FFFFFF" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: "bold", fontSize: "0.95rem" }}>
            SalesMate <span style={{ color: "var(--color-primary)" }}>AI</span>
          </span>
        </div>

        <button onClick={toggleSidebar} style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", padding: "4px", display: "flex" }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </>
  );
}
