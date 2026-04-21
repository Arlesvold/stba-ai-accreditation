"use client";

import { useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Download, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

type RiskLevel = "Rendah" | "Sedang" | "Tinggi";

type Finding = {
  no: number;
  document: string;
  issue: string;
  riskLevel: RiskLevel;
  recommendationAi: string;
};

type CheckResult = {
  checker: {
    title: string;
    systemName: string;
    institutionName: string;
    checkedDate: string;
    documentsChecked: string;
  };
  summary: {
    overallConsistencyPercent: number;
    status: "Konsisten" | "Perlu Perbaikan";
    inconsistencyCount: number;
    evidenceVerifiedCount: number;
    aiConfidenceScore: number;
    lastCheckedAt: string;
  };
  findings: Finding[];
  overallRecommendation: string;
  aiNote: string;
  audit: {
    historyId: string;
  };
};

type HistoryItem = {
  id: string;
  changedAt: string;
  changedBy: string;
  result?: {
    checkedDate?: string;
    summary?: {
      overallConsistencyPercent?: number;
      inconsistencyCount?: number;
    };
  };
};

const MOCK_RESULT: CheckResult = {
  checker: {
    title: "AI Consistency Checker",
    systemName: "AI-Based Accreditation Intelligence System",
    institutionName: "Sekolah Tinggi Bahasa Asing (STBA) Pontianak",
    checkedDate: "21 April 2026",
    documentsChecked: "LED + Kurikulum OBE + RPS (Academic Writing)",
  },
  summary: {
    overallConsistencyPercent: 92,
    status: "Konsisten",
    inconsistencyCount: 4,
    evidenceVerifiedCount: 18,
    aiConfidenceScore: 92,
    lastCheckedAt: "2026-04-21T14:40:00.000Z",
  },
  findings: [
    {
      no: 1,
      document: "LED vs RPS",
      issue: "Jumlah SKS Academic Writing tercatat 3 SKS di LED, namun 4 SKS pada RPS versi final.",
      riskLevel: "Sedang",
      recommendationAi:
        "Samakan SKS pada RPS menjadi 3 atau lakukan revisi LED agar metadata kurikulum sinkron.",
    },
    {
      no: 2,
      document: "Kurikulum OBE vs RPS",
      issue: "CLO-3 terkait citation APA 7 muncul pada dokumen OBE, tetapi belum termuat pada matriks CLO RPS.",
      riskLevel: "Rendah",
      recommendationAi:
        "Tambahkan CLO-3 pada tabel CLO RPS dan pastikan indikator penilaian terhubung ke rubrik mingguan.",
    },
    {
      no: 3,
      document: "LED vs Data Mahasiswa",
      issue: "Jumlah mahasiswa aktif di LED (350) berbeda dengan sinkronisasi PD-Dikti terakhir (342).",
      riskLevel: "Tinggi",
      recommendationAi:
        "Lakukan sinkronisasi ulang data PD-Dikti, lalu regenerate bagian data mahasiswa di LED.",
    },
    {
      no: 4,
      document: "RPS vs Rubrik Asesmen",
      issue: "Bobot Partisipasi & Reflection pada RPS (10%) belum tercermin di rubrik asesmen LMS.",
      riskLevel: "Sedang",
      recommendationAi:
        "Perbarui rubrik LMS agar bobot komponen penilaian identik dengan komposisi pada RPS.",
    },
  ],
  overallRecommendation:
    "Secara umum dokumen sudah KONSISTEN (92%). Prioritas perbaikan berada pada sinkronisasi data numerik (SKS dan mahasiswa aktif) agar tidak menimbulkan temuan mayor saat asesmen lapangan.",
  aiNote:
    "Hasil dihasilkan dari pemeriksaan semantik dan numerik lintas dokumen dengan evidence matching berbasis kebijakan validasi institusi.",
  audit: {
    historyId: "mock-run-2026-04-21-001",
  },
};

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "mock-run-2026-04-21-001",
    changedAt: "2026-04-21T14:40:00.000Z",
    changedBy: "system_ai",
    result: {
      summary: {
        overallConsistencyPercent: 92,
        inconsistencyCount: 4,
      },
    },
  },
  {
    id: "mock-run-2026-04-20-003",
    changedAt: "2026-04-20T16:11:00.000Z",
    changedBy: "system_ai",
    result: {
      summary: {
        overallConsistencyPercent: 89,
        inconsistencyCount: 6,
      },
    },
  },
];

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

export default function ConsistencyPage() {
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResult | null>(MOCK_RESULT);
  const [history, setHistory] = useState<HistoryItem[]>(MOCK_HISTORY);

  const highRiskCount = useMemo(
    () => (result?.findings ?? []).filter((item) => item.riskLevel === "Tinggi").length,
    [result],
  );

  async function runConsistencyCheck() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/consistency/check", {
        focusCourseName: "Academic Writing",
      });

      setResult(response.data.data as CheckResult);
      await loadHistory();
    } catch {
      setResult(MOCK_RESULT);
      setHistory(MOCK_HISTORY);
      setError("Backend belum merespons. Menampilkan contoh hasil default untuk pratinjau.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await api.get("/api/consistency/history?limit=8");
      setHistory(response.data.data as HistoryItem[]);
    } catch {
      setHistory(MOCK_HISTORY);
    } finally {
      setHistoryLoading(false);
    }
  }

  function buildMarkdownReport() {
    if (!result) {
      return "";
    }

    const findingRows = result.findings
      .map(
        (item) => `| ${item.no} | ${item.document} | ${item.issue} | ${item.riskLevel} | ${item.recommendationAi} |`,
      )
      .join("\n");

    return `# ${result.checker.title}\n\n- Sistem: ${result.checker.systemName}\n- Institusi: ${result.checker.institutionName}\n- Tanggal Cek: ${result.checker.checkedDate}\n- Dokumen Dicek: ${result.checker.documentsChecked}\n\n## Ringkasan\n\n- AI Confidence: ${result.summary.aiConfidenceScore}%\n- Evidence: ${result.summary.evidenceVerifiedCount}\n- Consistency Status: ${result.summary.status.toUpperCase()}\n- Last Checked: ${formatDateTime(result.summary.lastCheckedAt)}\n\n## Daftar Inkonsistensi yang Ditemukan\n\n| No | Dokumen | Isu Inkonsistensi | Tingkat Risiko | Rekomendasi AI |\n| --- | --- | --- | --- | --- |\n${findingRows}\n\n## Rekomendasi Keseluruhan AI\n\n${result.overallRecommendation}\n\n## Catatan AI\n\n${result.aiNote}\n`;
  }

  function download(filename: string, content: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function exportMarkdown() {
    const markdown = buildMarkdownReport();
    if (!markdown) {
      setError("Belum ada hasil validasi untuk diekspor.");
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    download(`consistency-check-${stamp}.md`, markdown, "text/markdown;charset=utf-8");
  }

  function exportPdf() {
    const markdown = buildMarkdownReport();
    if (!markdown) {
      setError("Belum ada hasil validasi untuk diekspor.");
      return;
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Laporan Konsistensi Dokumen</title>
          <style>
            body { font-family: Cambria, Georgia, serif; margin: 24mm 18mm; line-height: 1.45; color: #111827; }
            h1, h2 { margin-bottom: 8px; }
            p, li { font-size: 13px; }
            pre { white-space: pre-wrap; font-size: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; }
          </style>
        </head>
        <body>
          <h1>Laporan Konsistensi Dokumen Akreditasi</h1>
          <pre>${markdown.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");
    if (!win) {
      setError("Popup diblokir browser. Izinkan popup untuk export PDF.");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Konsistensi &amp; Validasi</h2>
        <p className="text-sm text-slate-500">Cross-Document AI Consistency Checker</p>
      </div>

      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Run Consistency Check</CardTitle>
          <CardDescription>
            Cek konsistensi antar LED, Kurikulum OBE, dan RPS untuk menilai kesiapan dokumen akreditasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={runConsistencyCheck} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Run Consistency Check
                </>
              )}
            </Button>
            <Button variant="outline" onClick={loadHistory} disabled={historyLoading} className="border-teal-200 text-teal-700 hover:bg-teal-50">
              {historyLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <span className="text-xs text-slate-500">Mode default menampilkan contoh hasil realistis untuk presentasi.</span>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      {result ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription>AI Confidence</CardDescription>
                <CardTitle className="text-2xl text-blue-700">{result.summary.aiConfidenceScore}%</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-teal-200">
              <CardHeader className="pb-2">
                <CardDescription>Evidence</CardDescription>
                <CardTitle className="text-2xl text-teal-700">{result.summary.evidenceVerifiedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription>Consistency Status</CardDescription>
                <CardTitle className="text-lg text-blue-700">{result.summary.status.toUpperCase()}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-teal-200">
              <CardHeader className="pb-2">
                <CardDescription>Last Checked</CardDescription>
                <CardTitle className="text-sm text-teal-700">{formatDateTime(result.summary.lastCheckedAt)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {highRiskCount > 0 ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-2 pt-6 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Terdapat {highRiskCount} temuan risiko tinggi. Prioritaskan perbaikan sebelum submit dokumen.
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Daftar Inkonsistensi yang Ditemukan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-teal-50 text-left text-slate-700">
                      <th className="border px-3 py-2">No</th>
                      <th className="border px-3 py-2">Dokumen</th>
                      <th className="border px-3 py-2">Isu Inkonsistensi</th>
                      <th className="border px-3 py-2">Tingkat Risiko</th>
                      <th className="border px-3 py-2">Rekomendasi AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.findings.map((item) => (
                      <tr key={item.no}>
                        <td className="border px-3 py-2 align-top">{item.no}</td>
                        <td className="border px-3 py-2 align-top">{item.document}</td>
                        <td className="border px-3 py-2 align-top">{item.issue}</td>
                        <td className="border px-3 py-2 align-top">{item.riskLevel}</td>
                        <td className="border px-3 py-2 align-top">{item.recommendationAi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Rekomendasi Keseluruhan AI</p>
                <p className="mt-1">{result.overallRecommendation}</p>
                <p className="mt-3 text-xs text-slate-500">{result.aiNote}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportMarkdown}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Markdown
                </Button>
                <Button variant="outline" onClick={exportPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Validasi Terakhir</CardTitle>
          <CardDescription>Audit trail eksekusi consistency checker untuk pelacakan perubahan.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada riwayat. Jalankan consistency check terlebih dahulu.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium text-slate-900">Run ID: {item.id}</p>
                  <p className="text-slate-600">Waktu: {formatDateTime(item.changedAt)}</p>
                  <p className="text-slate-600">Actor: {item.changedBy}</p>
                  <p className="text-slate-600">
                    Konsistensi: {item.result?.summary?.overallConsistencyPercent ?? "-"}% | Inconsistency: {item.result?.summary?.inconsistencyCount ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
