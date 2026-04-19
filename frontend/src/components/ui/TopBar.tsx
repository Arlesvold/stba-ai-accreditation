"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const pageMeta = [
  {
    href: "/dashboard/accreditation",
    title: "Akreditasi",
    subtitle: "Readiness & Criteria Scores",
  },
  {
    href: "/dashboard/spmi",
    title: "Tata Pamong",
    subtitle: "SPMI Monitoring & PPEPP",
  },
  {
    href: "/dashboard/student",
    title: "Mahasiswa",
    subtitle: "Alumni, Tracer, & Prestasi",
  },
  {
    href: "/dashboard/bkd",
    title: "BKD Dosen",
    subtitle: "Beban Kerja Dosen",
  },
  {
    href: "/dashboard/iku",
    title: "IKU",
    subtitle: "Indikator Kinerja Utama",
  },
  {
    href: "/dashboard/led",
    title: "LED Generator",
    subtitle: "Laporan Evaluasi Diri",
  },
  {
    href: "/dashboard/obe",
    title: "Kurikulum OBE",
    subtitle: "AI Draft Generator",
  },
  {
    href: "/dashboard/research",
    title: "Penelitian",
    subtitle: "Publikasi, Hibah, & HKI",
  },
  {
    href: "/dashboard/kerjasama",
    title: "Kerjasama",
    subtitle: "MoU & Partnership",
  },
  {
    href: "/dashboard/risk",
    title: "Risiko",
    subtitle: "Risk Alerts & Follow Up",
  },
  {
    href: "/dashboard/users",
    title: "Users",
    subtitle: "User Management",
  },
];

export function TopBar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const profile = user as { name?: string; fullName?: string } | null;
  const displayName = profile?.fullName ?? profile?.name ?? "Super Admin STBA";
  const currentPage =
    pageMeta.find((page) => pathname === page.href || pathname.startsWith(`${page.href}/`)) ??
    { title: "AI Accreditation Intelligence System", subtitle: "Document Intelligence Engine" };
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed left-[220px] right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
      <div className="leading-tight">
        <h1 className="text-[15px] font-semibold text-[#0F172A]">{currentPage.title}</h1>
        <p className="mt-0.5 text-[11px] text-[#94A3B8]">{currentPage.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-btn border border-[#E2E8F0] text-[#64748B]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-[5px] top-[5px] h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
        </button>

        <div className="text-right leading-tight">
          <p className="text-[13px] font-medium text-[#0F172A]">{displayName}</p>
          <p className="text-[11px] text-[#94A3B8]">Administrator</p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-[13px] font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
