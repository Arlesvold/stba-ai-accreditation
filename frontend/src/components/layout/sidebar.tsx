"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSearch,
  Landmark,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  FlaskConical,
  Handshake,
  CircleHelp,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NavItem } from "@/components/ui/nav-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    href: "/dashboard",
    label: "Ringkasan",
    description: "Dashboard Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/accreditation",
    label: "VMTS",
    description: "Visi, Misi & Strategi",
    icon: FileSearch,
  },
  {
    href: "/dashboard/spmi",
    label: "Tata Pamong",
    description: "Governance",
    icon: Landmark,
  },
  {
    href: "/dashboard/student",
    label: "Mahasiswa",
    description: "Students",
    icon: GraduationCap,
  },
  {
    href: "/dashboard/bkd",
    label: "SDM",
    description: "Human Resources",
    icon: Briefcase,
  },
  {
    href: "/dashboard/iku",
    label: "Sarpras",
    description: "Infrastructure",
    icon: Building2,
  },
  {
    href: "/dashboard/led",
    label: "Pendidikan",
    description: "Education",
    icon: BookOpen,
  },
  {
    href: "/dashboard/research",
    label: "Penelitian",
    description: "Research",
    icon: FlaskConical,
  },
  {
    href: "/dashboard/kerjasama",
    label: "Pengabdian",
    description: "Community Service",
    icon: Handshake,
  },
  {
    href: "/dashboard/risk",
    label: "Kriteria Lain",
    description: "Risk & Follow Up",
    icon: CircleHelp,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-900 bg-[#0f0f1a] text-white transition-all duration-300",
          collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
        )}
      >
        {/* Logo */}
        <div className="flex h-[74px] items-center gap-3 px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]">
            <span className="text-base font-bold">S</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-[15px] font-semibold tracking-wide text-white">STBA</span>
              <span className="truncate text-xs text-slate-400">Pontianak</span>
            </div>
          )}
        </div>

        <Separator className="bg-slate-800" />

        {!collapsed && (
          <div className="px-4 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            9 Kriteria IAPT
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const linkContent = (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                description={item.description}
                icon={item.icon}
                active={isActive}
                collapsed={collapsed}
              />
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <Link
            href="/dashboard/users"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-400 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:bg-white/5 hover:text-slate-200",
              collapsed && "justify-center px-2"
            )}
          >
            <LifeBuoy className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">Help &amp; Support</p>
                <p className="truncate text-[11px] text-slate-500">Documentation</p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="mt-3 w-full rounded-xl border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition-all duration-300 hover:bg-slate-900 hover:text-slate-200"
          >
            {collapsed ? "Expand Menu" : "Collapse Menu"}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
