import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SidebarNav, SidebarProfile } from "@/components/dashboard/sidebar-client";
import { SidebarToggle } from "@/components/dashboard/sidebar-toggle";
import {
  MessageSquare,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}

// Separate component to allow async server actions and DB queries
async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch tenant profile details to display
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { fullName: true, businessName: true, email: true },
  });

  const businessName = user?.businessName || "SalesMate Fashion Shop";
  const vendorName = user?.fullName || "Adeola";

  return (
    <div className="dashboard-layout-container">
      <SidebarToggle />
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside id="dashboard-sidebar" className="dashboard-sidebar"
        style={{
          width: "240px",
          background: "var(--color-sidebar-bg)",
          borderRight: "var(--border-sidebar)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <div>
          {/* Brand Logo Header */}
          <div
            className="sidebar-brand-header"
            style={{
              padding: "var(--space-5) var(--space-4)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              borderBottom: "var(--border-sidebar)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={16} color="#FFFFFF" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-bold)",
                fontSize: "var(--size-h2)",
              }}
            >
              SalesMate <span style={{ color: "var(--color-primary)" }}>AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <SidebarNav />
        </div>

        {/* Profile + Logout at bottom */}
        <SidebarProfile
          businessName={businessName}
          vendorName={vendorName}
          vendorEmail={user?.email || ""}
        />
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="dashboard-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}


