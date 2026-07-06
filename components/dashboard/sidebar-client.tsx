"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Send,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard size={16} />, label: "Overview" },
  { href: "/analytics", icon: <BarChart3 size={16} />, label: "Analytics" },
  { href: "/products", icon: <ShoppingBag size={16} />, label: "Products Catalog" },
  { href: "/knowledge-base", icon: <BookOpen size={16} />, label: "Knowledge Base" },
  { href: "/conversations", icon: <Send size={16} />, label: "Conversations", badge: true },
  { href: "/leads", icon: <Users size={16} />, label: "Leads Directory" },
  { href: "/settings", icon: <Settings size={16} />, label: "Settings" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ padding: "var(--space-8) var(--space-3) var(--space-3)", display: "flex", flexDirection: "column", gap: "6px" }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              color: isActive ? "var(--color-primary)" : "var(--color-muted-foreground)",
              textDecoration: "none",
              fontSize: "var(--size-body)",
              transition: "all 0.2s ease",
              background: isActive ? "rgba(37, 211, 102, 0.08)" : "transparent",
            }}
            className="sidebar-item"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                style={{
                  background: "var(--color-destructive)",
                  width: "6px",
                  height: "6px",
                  borderRadius: "var(--radius-full)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarProfile({ businessName, vendorName, vendorEmail, whatsappConnected }: { businessName: string; vendorName: string; vendorEmail: string; whatsappConnected?: boolean }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <div ref={containerRef} style={{ borderTop: "var(--border-sidebar)" }}>
      <div
        onClick={() => setProfileOpen(!profileOpen)}
        style={{
          padding: "var(--space-4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        className="sidebar-profile"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", overflow: "hidden" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-primary-text)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            {vendorName.charAt(0)}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div
              style={{
                fontSize: "var(--size-body)",
                fontWeight: "var(--weight-semibold)",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {businessName}
              <span
                title={whatsappConnected ? "WhatsApp connected" : "WhatsApp disconnected"}
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: whatsappConnected ? "#10B981" : "#EF4444",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            </div>
            <div
              style={{
                fontSize: "var(--size-label)",
                color: "var(--color-muted-foreground)",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {whatsappConnected ? "WhatsApp Online" : "WhatsApp Offline"}
            </div>
          </div>
        </div>
        <ChevronUp size={14} style={{ transform: profileOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} />
      </div>

      {profileOpen && (
        <div style={{ padding: "0 var(--space-3) var(--space-3)" }}>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              style={{
                width: "100%",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                color: "var(--color-muted-foreground)",
                fontSize: "var(--size-body)",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
              className="sidebar-item"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
