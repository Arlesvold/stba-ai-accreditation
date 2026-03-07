"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Navbar
        sidebarCollapsed={collapsed}
        onMenuClick={() => setCollapsed(!collapsed)}
      />
      <main
        className={cn(
          "pt-16 transition-all duration-300",
          collapsed
            ? "ml-[var(--sidebar-collapsed-width)]"
            : "ml-[var(--sidebar-width)]"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
