"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  Landmark,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  BookMarked,
  NotebookText,
  FlaskConical,
  Handshake,
  CircleHelp,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Ringkasan", subLabel: "Dashboard Overview", icon: LayoutDashboard },
  { href: "/dashboard/accreditation", label: "Akreditasi", subLabel: "Readiness & Criteria", icon: FileSearch },
  { href: "/dashboard/spmi", label: "Tata Pamong", subLabel: "SPMI & PPEPP Cycle", icon: Landmark },
  { href: "/dashboard/student", label: "Mahasiswa", subLabel: "Alumni & Tracer", icon: GraduationCap },
  { href: "/dashboard/bkd", label: "BKD Dosen", subLabel: "Beban Kerja Dosen", icon: Briefcase },
  { href: "/dashboard/iku", label: "IKU", subLabel: "Indikator Kinerja", icon: Building2 },
  { href: "/dashboard/led", label: "LED", subLabel: "Document Generator", icon: BookOpen },
  { href: "/dashboard/obe", label: "Kurikulum OBE", subLabel: "Outcome-Based Education", icon: BookMarked },
  { href: "/dashboard/rps", label: "RPS", subLabel: "Rencana Pembelajaran", icon: NotebookText },
  { href: "/dashboard/consistency", label: "Konsistensi", subLabel: "Validasi Dokumen AI", icon: ShieldCheck },
  { href: "/dashboard/research", label: "Penelitian", subLabel: "Publikasi & Hibah", icon: FlaskConical },
  { href: "/dashboard/kerjasama", label: "Kerjasama", subLabel: "MoU & Partnership", icon: Handshake },
  { href: "/dashboard/risk", label: "Risiko", subLabel: "Risk & Follow Up", icon: CircleHelp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col overflow-hidden bg-[#0F172A]">
      <div className="bg-[#0F172A] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-semibold text-white">
            S
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">STBA Pontianak</p>
            <p className="text-[11px] text-white/40">AI Accreditation System</p>
          </div>
        </div>
      </div>

      <div className="px-3 pb-2 pt-5 text-[10px] uppercase tracking-[0.1em] text-white/30">9 KRITERIA IAPT</div>

      <nav className="flex-1 space-y-[1px] overflow-y-auto px-0 py-1">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mx-2 flex items-center gap-3 rounded-md px-3 py-[9px] transition-all duration-150",
                isActive
                  ? "border-l-[3px] border-[#2563EB] bg-[rgba(37,99,235,0.2)] text-white rounded-l-none"
                  : "text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-60")} />
              <div>
                <p className="text-[13px] leading-tight">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-[rgba(255,255,255,0.25)]">{item.subLabel}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(255,255,255,0.08)] p-4">
        <Link href="/dashboard/users" className="flex items-center gap-2 text-[13px] text-[rgba(255,255,255,0.5)] hover:text-white">
          <LifeBuoy className="h-4 w-4 opacity-70" />
          Help &amp; Support
        </Link>
      </div>
    </aside>
  );
}
