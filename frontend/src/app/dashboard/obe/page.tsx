"use client";

import { ChangeEvent, useRef, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Loader2, Sparkles, Upload } from "lucide-react";

type ObeData = {
  metadata?: {
    programStudy?: string;
    academicYear?: string;
    generatedDate?: string;
    draftVersion?: string;
    institutionName?: string;
  };
  insights?: {
    confidenceScore?: number;
    evidenceCountUsed?: number;
    lastGeneratedAt?: string;
  };
  sections?: {
    graduateProfiles?: Array<{ description: string }>;
    plos?: Array<{ code: string; title: string; description: string }>;
    courseMappings?: Array<{
      courseName: string;
      sks: number;
      cloUtama: string;
      ploSupported: string[];
    }>;
    sampleCourseName?: string;
    sampleClos?: Array<{
      code: string;
      description: string;
      targetAchievementPct?: number;
    }>;
    assessment?: {
      utsPercent: number;
      uasPercent: number;
      assignmentPercent: number;
    };
    aiNote?: string;
  };
  output?: {
    markdown?: string;
  };
};

type ObeResponse = {
  data?: ObeData;
};

type ObeImportPayload = {
  programStudy?: string;
  academicYear?: string;
  draftVersion?: string;
  data?: ObeData;
  output?: {
    markdown?: string;
  };
};

const PROGRAM_STUDY_OPTIONS = [
  "S1 Sastra Inggris",
  "S1 Sastra Jepang",
  "D3 Bahasa Inggris",
];

const ACADEMIC_YEAR_OPTIONS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
];

const DRAFT_VERSION_OPTIONS = [
  "1.0",
  "1.1",
  "1.2",
  "2.0",
];

export default function ObePage() {
  const [programStudy, setProgramStudy] = useState(PROGRAM_STUDY_OPTIONS[0]);
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEAR_OPTIONS[2]);
  const [draftVersion, setDraftVersion] = useState(DRAFT_VERSION_OPTIONS[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [obeData, setObeData] = useState<ObeData | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const importInputRef = useRef<HTMLInputElement>(null);

  function triggerImport() {
    importInputRef.current?.click();
  }

  function downloadFile(fileName: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function handleExportMarkdown() {
    if (!markdown) {
      setError("Belum ada hasil markdown untuk diekspor.");
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`obe-draft-${stamp}.md`, markdown, "text/markdown;charset=utf-8");
  }

  function buildDocumentHtml() {
    if (!obeData) {
      return "";
    }

    const pRows = (obeData.sections?.plos ?? [])
      .map(
        (item, index) =>
          `<tr><td>${index + 1}</td><td>${item.code}</td><td>${item.title}</td><td>${item.description}</td></tr>`,
      )
      .join("");

    const mRows = (obeData.sections?.courseMappings ?? [])
      .map(
        (item) =>
          `<tr><td>${item.courseName}</td><td>${item.sks}</td><td>${item.cloUtama}</td><td>${item.ploSupported.join(", ")}</td></tr>`,
      )
      .join("");

    const cloList = (obeData.sections?.sampleClos ?? [])
      .map(
        (item) =>
          `<li><strong>${item.code}</strong>: ${item.description}${typeof item.targetAchievementPct === "number" ? ` (${item.targetAchievementPct}% target)` : ""}</li>`,
      )
      .join("");

    const gpList = (obeData.sections?.graduateProfiles ?? [])
      .map((item) => `<li>${item.description}</li>`)
      .join("");

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Dokumen OBE</title>
          <style>
            @page { margin: 24mm 18mm 20mm 18mm; }
            body { font-family: Cambria, Georgia, serif; color: #111827; margin: 0; line-height: 1.45; }
            h1,h2,h3 { margin: 0 0 10px 0; }
            h1 { font-size: 24px; }
            h2 { font-size: 18px; margin-top: 16px; }
            h3 { font-size: 15px; margin-top: 14px; }
            p, li { font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 7px; font-size: 12px; vertical-align: top; }
            th { background: #f1f5f9; text-align: left; }
            .meta { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 10px 0 14px 0; }
            .container { padding: 0; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 16px; }
            .logo { width: 44px; height: 44px; border: 2px solid #0f172a; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
            .header-meta { text-align: right; font-size: 11px; color: #334155; }
            .footer { position: fixed; bottom: 8mm; left: 18mm; right: 18mm; border-top: 1px solid #cbd5e1; padding-top: 4px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
            .pageNumber::after { content: counter(page); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">STBA</div>
              <div>
                <h1>KURIKULUM OUTCOME-BASED EDUCATION (OBE)</h1>
                <p><strong>${obeData.metadata?.institutionName ?? "STBA Pontianak"}</strong></p>
              </div>
              <div class="header-meta">
                <div>AI Accreditation Intelligence System</div>
                <div>Draft ${obeData.metadata?.draftVersion ?? "-"}</div>
              </div>
            </div>

            <div class="meta">
              <p><strong>Program Studi:</strong> ${obeData.metadata?.programStudy ?? "-"}</p>
              <p><strong>Tahun Akademik:</strong> ${obeData.metadata?.academicYear ?? "-"}</p>
              <p><strong>Tanggal Generate:</strong> ${obeData.metadata?.generatedDate ?? "-"}</p>
              <p><strong>Versi Draft:</strong> ${obeData.metadata?.draftVersion ?? "-"}</p>
            </div>

            <h2>1. Profil Lulusan</h2>
            <ul>${gpList}</ul>

            <h2>2. Program Learning Outcomes (PLO)</h2>
            <table>
              <thead><tr><th>No</th><th>Kode</th><th>Judul</th><th>Deskripsi</th></tr></thead>
              <tbody>${pRows}</tbody>
            </table>

            <h2>3. Mapping Mata Kuliah ke PLO (Contoh Semester 1-4)</h2>
            <table>
              <thead><tr><th>Mata Kuliah</th><th>SKS</th><th>CLO Utama</th><th>PLO Didukung</th></tr></thead>
              <tbody>${mRows}</tbody>
            </table>

            <h2>4. Contoh CLO - ${obeData.sections?.sampleCourseName ?? "-"}</h2>
            <ul>${cloList}</ul>

            <h2>5. Assessment</h2>
            <p>UTS ${obeData.sections?.assessment?.utsPercent ?? 0}% | UAS ${obeData.sections?.assessment?.uasPercent ?? 0}% | Tugas ${obeData.sections?.assessment?.assignmentPercent ?? 0}%</p>

            <h3>Catatan AI</h3>
            <p>${obeData.sections?.aiNote ?? "-"}</p>
          </div>

          <div class="footer">
            <span>Sekolah Tinggi Bahasa Asing (STBA) Pontianak</span>
            <span>Halaman <span class="pageNumber"></span></span>
          </div>
        </body>
      </html>
    `;
  }

  function handleExportWord() {
    const html = buildDocumentHtml();
    if (!html) {
      setError("Belum ada data OBE untuk diekspor ke Word.");
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`obe-draft-${stamp}.doc`, html, "application/msword;charset=utf-8");
  }

  function handleExportPdf() {
    const html = buildDocumentHtml();
    if (!html) {
      setError("Belum ada data OBE untuk diekspor ke PDF.");
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");
    if (!printWindow) {
      setError("Popup diblokir browser. Izinkan popup untuk export PDF.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function handleExportJson() {
    if (!obeData) {
      setError("Belum ada data OBE untuk diekspor.");
      return;
    }

    const payload = {
      programStudy,
      academicYear,
      draftVersion,
      data: obeData,
    };

    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(
      `obe-draft-${stamp}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8",
    );
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ObeImportPayload;
      const importedData = parsed.data ?? null;

      if (parsed.programStudy) setProgramStudy(parsed.programStudy);
      if (parsed.academicYear) setAcademicYear(parsed.academicYear);
      if (parsed.draftVersion) setDraftVersion(parsed.draftVersion);
      if (importedData) {
        setObeData(importedData);
        setMarkdown(importedData.output?.markdown ?? parsed.output?.markdown ?? "");
      } else if (parsed.output?.markdown) {
        setMarkdown(parsed.output.markdown);
      }

      setError(null);
    } catch {
      setError("File import tidak valid. Gunakan file JSON export dari halaman OBE.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        programStudy,
        academicYear,
        generatedDate: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        draftVersion,
      };

      const response = await api.post<ObeResponse>("/obe/generate-draft", payload);
      const result = response.data?.data ?? null;
      setObeData(result);
      setMarkdown(result?.output?.markdown ?? "");
    } catch {
      setError("Gagal generate draft OBE. Pastikan backend aktif dan token login tersedia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kurikulum OBE</h2>
        <p className="text-muted-foreground">
          Generate draft Kurikulum Outcome-Based Education dan lihat hasilnya langsung.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
        <Button type="button" variant="outline" onClick={triggerImport}>
          <Upload className="mr-2 h-4 w-4" />
          Import JSON
        </Button>
        <Button type="button" variant="outline" onClick={handleExportJson}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button type="button" variant="outline" onClick={handleExportMarkdown}>
          <Download className="mr-2 h-4 w-4" />
          Export Markdown
        </Button>
        <Button type="button" variant="outline" onClick={handleExportWord}>
          <Download className="mr-2 h-4 w-4" />
          Export to Word
        </Button>
        <Button type="button" variant="outline" onClick={handleExportPdf}>
          <Download className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input Draft OBE</CardTitle>
            <CardDescription>
              Isi parameter utama, lalu klik generate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="programStudy">
                Program Studi
              </label>
              <select
                id="programStudy"
                value={programStudy}
                onChange={(e) => setProgramStudy(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PROGRAM_STUDY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="academicYear">
                Tahun Akademik
              </label>
              <select
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ACADEMIC_YEAR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="draftVersion">
                Versi Draft
              </label>
              <select
                id="draftVersion"
                value={draftVersion}
                onChange={(e) => setDraftVersion(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DRAFT_VERSION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Draft OBE
            </Button>
            {loading && (
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                AI sedang memproses dokumen OBE... estimasi ±12 detik.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview Dokumen OBE</CardTitle>
            <CardDescription>
              Tampilan terstruktur hasil generate endpoint OBE.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {obeData ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">AI Confidence Score</p>
                    <p className="text-lg font-semibold">{obeData.insights?.confidenceScore ?? "-"}%</p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Evidence Digunakan</p>
                    <p className="text-lg font-semibold">{obeData.insights?.evidenceCountUsed ?? "-"}</p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Last Generated</p>
                    <p className="text-sm font-semibold">
                      {obeData.insights?.lastGeneratedAt
                        ? new Date(obeData.insights.lastGeneratedAt).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">{obeData.metadata?.institutionName ?? "STBA Pontianak"}</p>
                  <p>Program Studi: {obeData.metadata?.programStudy ?? "-"}</p>
                  <p>Tahun Akademik: {obeData.metadata?.academicYear ?? "-"}</p>
                  <p>Tanggal Generate: {obeData.metadata?.generatedDate ?? "-"}</p>
                  <p>Versi Draft: {obeData.metadata?.draftVersion ?? "-"}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Profil Lulusan</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {(obeData.sections?.graduateProfiles ?? []).map((item, index) => (
                      <li key={`gp-${index}`}>{item.description}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">PLO</h3>
                  <div className="overflow-auto rounded-md border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-3 py-2">Kode</th>
                          <th className="px-3 py-2">Judul</th>
                          <th className="px-3 py-2">Deskripsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(obeData.sections?.plos ?? []).map((item) => (
                          <tr key={item.code} className="border-t">
                            <td className="px-3 py-2 font-medium">{item.code}</td>
                            <td className="px-3 py-2">{item.title}</td>
                            <td className="px-3 py-2">{item.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Mapping Mata Kuliah ke PLO (Contoh Semester 1-4)</h3>
                  <div className="overflow-auto rounded-md border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-3 py-2">Mata Kuliah</th>
                          <th className="px-3 py-2">SKS</th>
                          <th className="px-3 py-2">CLO Utama</th>
                          <th className="px-3 py-2">PLO Didukung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(obeData.sections?.courseMappings ?? []).map((item, index) => (
                          <tr key={`cm-${index}`} className="border-t align-top">
                            <td className="px-3 py-2">{item.courseName}</td>
                            <td className="px-3 py-2">{item.sks}</td>
                            <td className="px-3 py-2">{item.cloUtama}</td>
                            <td className="px-3 py-2">{item.ploSupported.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Contoh CLO - {obeData.sections?.sampleCourseName ?? "-"}
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {(obeData.sections?.sampleClos ?? []).map((item) => (
                      <li key={item.code}>
                        {item.code}: {item.description}
                        {typeof item.targetAchievementPct === "number"
                          ? ` (${item.targetAchievementPct}% target)`
                          : ""}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Assessment</p>
                  <p>UTS: {obeData.sections?.assessment?.utsPercent ?? 0}%</p>
                  <p>UAS: {obeData.sections?.assessment?.uasPercent ?? 0}%</p>
                  <p>Tugas: {obeData.sections?.assessment?.assignmentPercent ?? 0}%</p>
                </div>

                <div className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">Catatan AI</p>
                  <p className="mt-1 text-muted-foreground">{obeData.sections?.aiNote ?? "-"}</p>
                </div>

                <details>
                  <summary className="cursor-pointer text-sm font-medium">Lihat Markdown Mentah</summary>
                  <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-xs leading-relaxed">
                    {markdown}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Belum ada hasil. Klik tombol Generate Draft OBE.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
