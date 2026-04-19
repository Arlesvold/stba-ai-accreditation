"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { DocCard } from "@/components/ui/DocCard";
import { ReadinessRing } from "@/components/ui/ReadinessRing";
import {
  FileText,
  BookOpen,
  FolderKanban,
} from "lucide-react";
import { useIkuStore } from "@/stores/iku-store";
import { useResearchStore } from "@/stores/research-store";
import { useAccreditationStore } from "@/stores/accreditation-store";

export default function DashboardPage() {
  const router = useRouter();
  const { items: ikuItems, fetchAll: fetchIku } = useIkuStore();
  const { fetchPublications, fetchGrants } = useResearchStore();
  const { readiness, fetchReadiness } = useAccreditationStore();

  useEffect(() => {
    fetchIku();
    fetchPublications();
    fetchGrants();
    fetchReadiness();
  }, [fetchIku, fetchPublications, fetchGrants, fetchReadiness]);

  const avgIku =
    ikuItems.length > 0
      ? Math.round(
          ikuItems.reduce((sum, i) => sum + i.percentage, 0) / ikuItems.length
        )
      : 0;

  const readinessScore = readiness?.percentage ?? avgIku;
  const pct = Number(readinessScore) || 0;

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
              <span className="text-[11px] font-medium text-[#1D4ED8]">AI-Powered Document Intelligence</span>
            </div>

            <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              AI Document Generator
            </h2>
            <p className="mt-3 max-w-[380px] text-[13px] leading-[1.6] text-[#64748B]">
              Menyusun LED, RPS, Kurikulum OBE, dan dokumen akreditasi secara otomatis dengan teknologi AI.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/dashboard/led")}
                className="h-auto rounded-btn bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]"
              >
                Mulai Generate
              </Button>
              <Button
                variant="outline"
                className="h-auto rounded-btn border border-[#D1D5DB] bg-white px-4 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#F8FAFC]"
              >
                Lihat Alur Dokumen
              </Button>
            </div>
          </div>

          <div className="flex w-[160px] items-center justify-center">
            <ReadinessRing percent={pct} status="Baik Sekali" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Documents Generated" value="247" barPercent={82} />
        <StatCard label="IAPT Criteria Covered" value="8 / 9" barPercent={89} />
        <StatCard label="Compliance Rate" value="98%" barPercent={98} barColor="#16A34A" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#0F172A]">Primary Document Generators</h3>
          <button
            type="button"
            className="text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Lihat semua
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DocCard
            icon={<FileText className="h-[18px] w-[18px]" />}
            title="LED Auto-Generator"
            description="Generate LED dokumen secara otomatis berdasarkan data institusi dan kebutuhan akreditasi."
            buttonLabel="Buka Generator"
            onButtonClick={() => router.push("/dashboard/led")}
          />
          <DocCard
            icon={<BookOpen className="h-[18px] w-[18px]" />}
            title="Kurikulum OBE"
            description="Rancang kurikulum Outcome-Based Education dengan pemetaan CPL, CPMK, dan mata kuliah."
            buttonLabel="Buka Kurikulum"
            onButtonClick={() => router.push("/dashboard/iku")}
          />
          <DocCard
            icon={<FolderKanban className="h-[18px] w-[18px]" />}
            title="Evidence Binding"
            description="Kelola dan tautkan dokumen eviden ke komponen akreditasi secara terstruktur dan konsisten."
            buttonLabel="Kelola Eviden"
            onButtonClick={() => router.push("/dashboard/accreditation")}
          />
        </div>
      </section>
    </div>
  );
}
