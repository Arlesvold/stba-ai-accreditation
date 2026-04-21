"use client";

import { ChangeEvent, useRef, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Loader2, Sparkles, Upload } from "lucide-react";

type RpsData = {
  metadata?: {
    generatedDate?: string;
    draftVersion?: string;
    courseName?: string;
    courseCode?: string;
    programStudy?: string;
    semester?: string;
    sks?: number;
    academicYear?: string;
    totalWeeks?: number;
    institutionName?: string;
  };
  insights?: {
    confidenceScore?: number;
    evidenceCountUsed?: number;
    lastGeneratedAt?: string;
    consistencyStatus?: string;
  };
  sections?: {
    courseDescription?: string;
    prerequisites?: string[];
    clos?: Array<{
      code: string;
      clo: string;
      taxonomyLevel: string;
      indicator: string;
    }>;
    weeklyPlan?: Array<{
      week: string;
      topicSubtopic: string;
      learningMethod: string;
      duration: string;
      assessment: string;
    }>;
    learningResources?: string[];
    finalAssessment?: {
      utsPercent: number;
      uasPercent: number;
      assignmentPortfolioPercent: number;
      participationReflectionPercent: number;
    };
    aiNote?: string;
  };
  output?: {
    markdown?: string;
  };
};

type RpsResponse = {
  data?: RpsData;
};

type RpsImportPayload = {
  courseName?: string;
  courseCode?: string;
  programStudy?: string;
  semester?: string;
  sks?: number;
  academicYear?: string;
  draftVersion?: string;
  data?: RpsData;
};

const COURSE_OPTIONS = [
  {
    name: "Academic Writing",
    code: "ENG-301",
    sks: 3,
    semester: "3 (Ganjil)",
    programStudy: "S1 Sastra Inggris",
  },
  {
    name: "Introduction to Linguistics",
    code: "ENG-201",
    sks: 3,
    semester: "2 (Genap)",
    programStudy: "S1 Sastra Inggris",
  },
  {
    name: "Translation and Interpreting",
    code: "ENG-305",
    sks: 3,
    semester: "5 (Ganjil)",
    programStudy: "S1 Sastra Inggris",
  },
];

const ACADEMIC_YEAR_OPTIONS = ["2025/2026", "2026/2027", "2027/2028"];
const DRAFT_VERSION_OPTIONS = ["1.0", "1.1", "1.2", "2.0"];

export default function RpsPage() {
  const [selectedCourse, setSelectedCourse] = useState(COURSE_OPTIONS[0].name);
  const [programStudy, setProgramStudy] = useState(COURSE_OPTIONS[0].programStudy);
  const [courseCode, setCourseCode] = useState(COURSE_OPTIONS[0].code);
  const [semester, setSemester] = useState(COURSE_OPTIONS[0].semester);
  const [sks, setSks] = useState(COURSE_OPTIONS[0].sks);
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEAR_OPTIONS[1]);
  const [draftVersion, setDraftVersion] = useState(DRAFT_VERSION_OPTIONS[2]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rpsData, setRpsData] = useState<RpsData | null>(null);
  const [markdown, setMarkdown] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  function handleCourseChange(courseName: string) {
    setSelectedCourse(courseName);
    const course = COURSE_OPTIONS.find((item) => item.name === courseName);
    if (!course) return;
    setProgramStudy(course.programStudy);
    setCourseCode(course.code);
    setSemester(course.semester);
    setSks(course.sks);
  }

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

  function handleExportJson() {
    if (!rpsData) {
      setError("Belum ada data RPS untuk diekspor.");
      return;
    }

    const payload = {
      courseName: selectedCourse,
      courseCode,
      programStudy,
      semester,
      sks,
      academicYear,
      draftVersion,
      data: rpsData,
    };

    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`rps-draft-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  function handleExportMarkdown() {
    if (!markdown) {
      setError("Belum ada markdown RPS untuk diekspor.");
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`rps-draft-${stamp}.md`, markdown, "text/markdown;charset=utf-8");
  }

  function buildDocumentHtml() {
    if (!rpsData) return "";

    const cloRows = (rpsData.sections?.clos ?? [])
      .map((item) => `<tr><td>${item.code}</td><td>${item.clo}</td><td>${item.taxonomyLevel}</td><td>${item.indicator}</td></tr>`)
      .join("");

    const weeklyRows = (rpsData.sections?.weeklyPlan ?? [])
      .map(
        (item) =>
          `<tr><td>${item.week}</td><td>${item.topicSubtopic}</td><td>${item.learningMethod}</td><td>${item.duration}</td><td>${item.assessment}</td></tr>`,
      )
      .join("");

    const resourceRows = (rpsData.sections?.learningResources ?? [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    const prerequisiteRows = (rpsData.sections?.prerequisites ?? [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>RPS - ${selectedCourse}</title>
          <style>
            @page { margin: 24mm 18mm 20mm 18mm; }
            body { font-family: Cambria, Georgia, serif; color: #111827; margin: 0; line-height: 1.45; }
            h1,h2,h3 { margin: 0 0 10px 0; }
            h1 { font-size: 24px; }
            h2 { font-size: 17px; margin-top: 14px; }
            h3 { font-size: 15px; margin-top: 12px; }
            p, li { font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 7px; font-size: 12px; vertical-align: top; }
            th { background: #f1f5f9; text-align: left; }
            .meta { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 10px 0 14px 0; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 16px; }
            .logo { width: 44px; height: 44px; border: 2px solid #0f172a; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
            .footer { position: fixed; bottom: 8mm; left: 18mm; right: 18mm; border-top: 1px solid #cbd5e1; padding-top: 4px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
            .pageNumber::after { content: counter(page); }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">STBA</div>
            <div>
              <h1>RENCANA PEMBELAJARAN SEMESTER (RPS)</h1>
              <p><strong>${rpsData.metadata?.institutionName ?? "STBA Pontianak"}</strong></p>
            </div>
            <div style="text-align:right;font-size:11px;color:#334155;">
              <div>Draft ${rpsData.metadata?.draftVersion ?? "-"}</div>
              <div>${rpsData.metadata?.generatedDate ?? "-"}</div>
            </div>
          </div>

          <div class="meta">
            <p><strong>Mata Kuliah:</strong> ${rpsData.metadata?.courseName ?? "-"}</p>
            <p><strong>Kode MK:</strong> ${rpsData.metadata?.courseCode ?? "-"}</p>
            <p><strong>Program Studi:</strong> ${rpsData.metadata?.programStudy ?? "-"}</p>
            <p><strong>Semester:</strong> ${rpsData.metadata?.semester ?? "-"}</p>
            <p><strong>SKS:</strong> ${rpsData.metadata?.sks ?? "-"}</p>
            <p><strong>Tahun Akademik:</strong> ${rpsData.metadata?.academicYear ?? "-"}</p>
          </div>

          <h2>1. Deskripsi Singkat Mata Kuliah</h2>
          <p>${rpsData.sections?.courseDescription ?? "-"}</p>

          <h2>2. Prasyarat Mata Kuliah</h2>
          <ul>${prerequisiteRows}</ul>

          <h2>3. Capaian Pembelajaran Mata Kuliah (CLO)</h2>
          <table>
            <thead><tr><th>No</th><th>CLO</th><th>Level Taksonomi</th><th>Indikator Penilaian</th></tr></thead>
            <tbody>${cloRows}</tbody>
          </table>

          <h2>4. Rencana Pembelajaran Mingguan (${rpsData.metadata?.totalWeeks ?? 16} Minggu)</h2>
          <table>
            <thead><tr><th>Minggu</th><th>Topik & Subtopik</th><th>Metode Pembelajaran</th><th>Waktu</th><th>Penilaian</th></tr></thead>
            <tbody>${weeklyRows}</tbody>
          </table>

          <h2>5. Media & Sumber Belajar</h2>
          <ul>${resourceRows}</ul>

          <h2>6. Penilaian Akhir</h2>
          <p>UTS ${rpsData.sections?.finalAssessment?.utsPercent ?? 0}% | UAS ${rpsData.sections?.finalAssessment?.uasPercent ?? 0}% | Tugas & Portofolio ${rpsData.sections?.finalAssessment?.assignmentPortfolioPercent ?? 0}% | Partisipasi & Reflection ${rpsData.sections?.finalAssessment?.participationReflectionPercent ?? 0}%</p>

          <h3>Catatan AI</h3>
          <p>${rpsData.sections?.aiNote ?? "-"}</p>

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
      setError("Belum ada data RPS untuk diekspor ke Word.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`rps-draft-${stamp}.doc`, html, "application/msword;charset=utf-8");
  }

  function handleExportPdf() {
    const html = buildDocumentHtml();
    if (!html) {
      setError("Belum ada data RPS untuk diekspor ke PDF.");
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

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as RpsImportPayload;

      if (parsed.courseName) {
        setSelectedCourse(parsed.courseName);
      }
      if (parsed.programStudy) setProgramStudy(parsed.programStudy);
      if (parsed.courseCode) setCourseCode(parsed.courseCode);
      if (parsed.semester) setSemester(parsed.semester);
      if (typeof parsed.sks === "number") setSks(parsed.sks);
      if (parsed.academicYear) setAcademicYear(parsed.academicYear);
      if (parsed.draftVersion) setDraftVersion(parsed.draftVersion);
      if (parsed.data) {
        setRpsData(parsed.data);
        setMarkdown(parsed.data.output?.markdown ?? "");
      }

      setError(null);
    } catch {
      setError("File import tidak valid. Gunakan JSON export dari halaman RPS.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        courseName: selectedCourse,
        courseCode,
        programStudy,
        semester,
        sks,
        academicYear,
        draftVersion,
      };

      const response = await api.post<RpsResponse>("/rps/generate-draft", payload);
      const data = response.data?.data ?? null;
      setRpsData(data);
      setMarkdown(data?.output?.markdown ?? "");
    } catch {
      setError("Gagal generate RPS. Pastikan backend aktif dan token login tersedia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">RPS Generator</h2>
        <p className="text-muted-foreground">
          Generate dokumen Rencana Pembelajaran Semester (RPS) berbasis OBE secara otomatis.
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
            <CardTitle className="text-base">Input RPS</CardTitle>
            <CardDescription>Isi parameter mata kuliah, lalu klik generate draft RPS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="courseName">Mata Kuliah</label>
              <select
                id="courseName"
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {COURSE_OPTIONS.map((course) => (
                  <option key={course.code} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="courseCode">Kode MK</label>
                <Input id="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sks">SKS</label>
                <Input id="sks" type="number" min={1} value={sks} onChange={(e) => setSks(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="semester">Semester</label>
                <Input id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="programStudy">Program Studi</label>
                <Input id="programStudy" value={programStudy} onChange={(e) => setProgramStudy(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="academicYear">Tahun Akademik</label>
                <select
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ACADEMIC_YEAR_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="draftVersion">Versi Draft</label>
                <select
                  id="draftVersion"
                  value={draftVersion}
                  onChange={(e) => setDraftVersion(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {DRAFT_VERSION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Draft RPS
            </Button>
            {loading && (
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                AI sedang memproses dokumen RPS... estimasi ±12 detik.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview Dokumen RPS</CardTitle>
            <CardDescription>Output terstruktur hasil AI Document Generator untuk RPS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rpsData ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">AI Confidence</p>
                    <p className="text-lg font-semibold">{rpsData.insights?.confidenceScore ?? "-"}%</p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Evidence</p>
                    <p className="text-lg font-semibold">{rpsData.insights?.evidenceCountUsed ?? "-"}</p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Consistency</p>
                    <p className="text-sm font-semibold">{rpsData.insights?.consistencyStatus ?? "-"}</p>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Last Generated</p>
                    <p className="text-sm font-semibold">
                      {rpsData.insights?.lastGeneratedAt
                        ? new Date(rpsData.insights.lastGeneratedAt).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">{rpsData.metadata?.institutionName ?? "STBA Pontianak"}</p>
                  <p>Mata Kuliah: {rpsData.metadata?.courseName ?? "-"}</p>
                  <p>Kode MK: {rpsData.metadata?.courseCode ?? "-"}</p>
                  <p>Program Studi: {rpsData.metadata?.programStudy ?? "-"}</p>
                  <p>Semester: {rpsData.metadata?.semester ?? "-"}</p>
                  <p>SKS: {rpsData.metadata?.sks ?? "-"}</p>
                  <p>Tahun Akademik: {rpsData.metadata?.academicYear ?? "-"}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Deskripsi Singkat Mata Kuliah</h3>
                  <p className="rounded-md border bg-muted/20 p-3 text-sm">
                    {rpsData.sections?.courseDescription ?? "-"}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Prasyarat Mata Kuliah</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {(rpsData.sections?.prerequisites ?? []).map((item, index) => (
                      <li key={`prereq-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Capaian Pembelajaran Mata Kuliah (CLO)</h3>
                  <div className="overflow-auto rounded-md border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-3 py-2">No</th>
                          <th className="px-3 py-2">CLO</th>
                          <th className="px-3 py-2">Level Taksonomi</th>
                          <th className="px-3 py-2">Indikator Penilaian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rpsData.sections?.clos ?? []).map((item) => (
                          <tr key={item.code} className="border-t align-top">
                            <td className="px-3 py-2 font-medium">{item.code}</td>
                            <td className="px-3 py-2">{item.clo}</td>
                            <td className="px-3 py-2">{item.taxonomyLevel}</td>
                            <td className="px-3 py-2">{item.indicator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Rencana Pembelajaran Mingguan ({rpsData.metadata?.totalWeeks ?? 16} Minggu)
                  </h3>
                  <div className="overflow-auto rounded-md border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-3 py-2">Minggu</th>
                          <th className="px-3 py-2">Topik</th>
                          <th className="px-3 py-2">Metode</th>
                          <th className="px-3 py-2">Waktu</th>
                          <th className="px-3 py-2">Penilaian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rpsData.sections?.weeklyPlan ?? []).map((item, index) => (
                          <tr key={`week-${index}`} className="border-t align-top">
                            <td className="px-3 py-2">{item.week}</td>
                            <td className="px-3 py-2">{item.topicSubtopic}</td>
                            <td className="px-3 py-2">{item.learningMethod}</td>
                            <td className="px-3 py-2">{item.duration}</td>
                            <td className="px-3 py-2">{item.assessment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Media & Sumber Belajar</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {(rpsData.sections?.learningResources ?? []).map((item, index) => (
                      <li key={`resource-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Penilaian Akhir</p>
                  <p>UTS: {rpsData.sections?.finalAssessment?.utsPercent ?? 0}%</p>
                  <p>UAS (Essay): {rpsData.sections?.finalAssessment?.uasPercent ?? 0}%</p>
                  <p>Tugas & Portofolio: {rpsData.sections?.finalAssessment?.assignmentPortfolioPercent ?? 0}%</p>
                  <p>Partisipasi & Reflection: {rpsData.sections?.finalAssessment?.participationReflectionPercent ?? 0}%</p>
                </div>

                <div className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">Catatan AI</p>
                  <p className="mt-1 text-muted-foreground">{rpsData.sections?.aiNote ?? "-"}</p>
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
                Belum ada hasil. Klik tombol Generate Draft RPS.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
