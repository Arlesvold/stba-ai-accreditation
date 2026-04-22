"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Gauge, Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AccreditationScore } from "@/components/modules/AccreditationScore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAccreditationStore } from "@/stores/accreditation-store";
import type { CreateScoreRequest } from "@/lib/types";

const AUTO_REFRESH_MS = 30_000;

export default function AccreditationPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState<CreateScoreRequest>({
    criteriaNo: 10,
    criteriaName: "",
    score: 0,
    maxScore: 100,
    year: new Date().getFullYear(),
    notes: "",
  });

  const { readiness, loading, error, fetchReadiness, createScore, updateScore } =
    useAccreditationStore();

  useEffect(() => {
    void fetchReadiness(selectedYear);

    const timer = window.setInterval(() => {
      void fetchReadiness(selectedYear);
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [fetchReadiness, selectedYear]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, year: selectedYear }));
  }, [selectedYear]);

  async function handleCreateScore(e: React.FormEvent) {
    e.preventDefault();
    const result = await createScore(form);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    setForm({
      criteriaNo: form.criteriaNo + 1,
      criteriaName: "",
      score: 0,
      maxScore: 100,
      year: selectedYear,
      notes: "",
    });
  }

  const criteriaCount = readiness?.criteria.length ?? 0;
  const criteria = readiness?.criteria ?? [];
  const atRiskCount =
    criteria.filter((item) => item.status === "at_risk").length;
  const overallScore = readiness?.overallScore ?? 0;
  const percentage = readiness?.percentage ?? 0;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Accreditation Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor estimasi indikator kinerja berbasis rubrik BAN-PT secara
            real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="accreditation-year">Tahun Asesmen</Label>
            <Input
              id="accreditation-year"
              type="number"
              min={2000}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value) || new Date().getFullYear())}
              className="w-32 bg-white"
            />
          </div>
          <Badge variant="outline" className="w-fit border-[#BFDBFE] text-[#1D4ED8]">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Sinkronisasi otomatis {AUTO_REFRESH_MS / 1000} detik
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-rose-300 bg-rose-50/50">
          <CardContent className="flex items-start gap-3 pt-6 text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#CBD5E1] bg-gradient-to-r from-[#EFF6FF] via-white to-[#ECFDF5]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[#0F172A]">
            <Gauge className="h-5 w-5 text-[#2563EB]" />
            Overall Score
          </CardTitle>
          <CardDescription>
            Ringkasan performa kesiapan indikator akreditasi program studi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-5xl font-bold tracking-tight text-[#0F172A]">
                {overallScore.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                dari skala {readiness?.maxScore ?? 100}
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[360px]">
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Kriteria Dinilai
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#0F172A]">
                  {criteriaCount}
                </p>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  At Risk
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#B45309]">
                  {atRiskCount}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Skor Rata-rata</span>
              <span className="font-semibold text-[#0F172A]">
                {percentage.toFixed(2)}%
              </span>
            </div>
            <Progress value={percentage} className="h-2.5 [&>div]:bg-[#2563EB]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Kriteria Baru</CardTitle>
          <CardDescription>
            Kriteria BAN-PT default akan di-seed otomatis saat dashboard tahun ini pertama kali dibuka.
            Form ini dipakai untuk menambah kriteria tambahan melalui endpoint POST /accreditation/scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateScore} className="grid gap-3 md:grid-cols-6">
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="criteria-no">No</Label>
              <Input
                id="criteria-no"
                type="number"
                min={1}
                value={form.criteriaNo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    criteriaNo: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="criteria-name">Nama Kriteria</Label>
              <Input
                id="criteria-name"
                value={form.criteriaName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    criteriaName: e.target.value,
                  }))
                }
                placeholder="Contoh: Aspek inovasi pembelajaran"
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="criteria-score">Skor</Label>
              <Input
                id="criteria-score"
                type="number"
                min={0}
                step="0.01"
                value={form.score}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    score: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="criteria-max">Max Score</Label>
              <Input
                id="criteria-max"
                type="number"
                min={1}
                step="0.01"
                value={form.maxScore ?? 100}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maxScore: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="criteria-year">Tahun</Label>
              <Input
                id="criteria-year"
                type="number"
                min={2000}
                value={form.year ?? selectedYear}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    year: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-5">
              <Label htmlFor="criteria-notes">Catatan</Label>
              <Input
                id="criteria-notes"
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Opsional"
              />
            </div>
            <div className="flex items-end md:col-span-1">
              <Button type="submit" className="w-full" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && !readiness ? (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : criteriaCount === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Data skor akreditasi belum tersedia. Tambahkan data kriteria pada
            tabel accreditation_scores untuk memulai analisis.
          </CardContent>
        </Card>
      ) : (
        <AccreditationScore
          criteria={criteria}
          loading={loading}
          onUpdate={updateScore}
        />
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Sistem memberikan estimasi indikator kinerja berdasarkan rubrik penilaian
        BAN-PT sebagai bahan evaluasi internal institusi sebelum proses asesmen
        resmi.
      </p>
    </div>
  );
}
