"use client";

import { useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  FileSearch,
  FileText,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const CRITERIA_OPTIONS = [
  { no: 1, code: "LED-C1", label: "Visi, Misi, Tujuan dan Strategi" },
  { no: 2, code: "LED-C2", label: "Tata Pamong, Tata Kelola dan Kerjasama" },
  { no: 3, code: "LED-C3", label: "Mahasiswa" },
  { no: 4, code: "LED-C4", label: "Sumber Daya Manusia" },
  { no: 5, code: "LED-C5", label: "Keuangan, Sarana dan Prasarana" },
  { no: 6, code: "LED-C6", label: "Pendidikan" },
  { no: 7, code: "LED-C7", label: "Penelitian" },
  { no: 8, code: "LED-C8", label: "Pengabdian kepada Masyarakat" },
  { no: 9, code: "LED-C9", label: "Luaran dan Capaian Tridharma" },
];

const DEFAULT_LED_DOCUMENT_DEFINITION_ID =
  process.env.NEXT_PUBLIC_LED_DOCUMENT_DEFINITION_ID ??
  "33000000-0000-0000-0000-000000000002";

const DEFAULT_INSTITUTION_ID =
  process.env.NEXT_PUBLIC_INSTITUTION_ID ??
  "a0000000-0000-0000-0000-000000000001";

const DEFAULT_STUDY_PROGRAM_ID =
  process.env.NEXT_PUBLIC_STUDY_PROGRAM_ID ??
  "b0000000-0000-0000-0000-000000000001";

const ACADEMIC_YEAR_BY_START_YEAR: Record<number, string> = {
  2020: "c0000000-0000-0000-0000-000000000001",
  2021: "c0000000-0000-0000-0000-000000000002",
  2022: "c0000000-0000-0000-0000-000000000003",
  2023: "c0000000-0000-0000-0000-000000000004",
  2024: "c0000000-0000-0000-0000-000000000005",
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

type LedStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type WorkspaceJob = {
  jobId: string;
  status: LedStatus;
  progress: number;
  createdAt: string;
  finishedAt?: string | null;
};

type SourceFact = {
  key: string;
  value: string;
};

type EvidenceItem = {
  evidenceCode: string;
  title: string;
  documentType: string | null;
  fileKey: string | null;
  fileName: string | null;
  criterionCode: string | null;
  mappingNote: string | null;
};

type DraftComment = {
  id: string;
  text: string;
  createdAt: string;
};

type DraftVersion = {
  id: string;
  label: string;
  content: string;
  createdAt: string;
  criterionNo: number | null;
  jobId: string | null;
};

type SectionOutputItem = {
  sectionText: string;
  sourceSnapshot?: unknown;
  documentSection?: {
    sectionCode: string;
    sectionName: string;
  };
};

type LedStatusResponse = {
  jobId: string;
  status: string;
  progress?: number;
  outputs?: Array<{
    id: string;
    title: string;
    status: string;
    sectionOutputs?: SectionOutputItem[];
  }>;
  startedAt?: string | null;
  finishedAt?: string | null;
};

type LedGenerateResponse = {
  jobId: string;
  status: string;
  progress?: number;
  startedAt?: string;
  finishedAt?: string;
};

type LedDownloadSection = {
  sectionCode: string;
  sectionName: string;
  sectionText: string;
  evidenceBindings?: unknown[];
};

type LedDownloadResponse = {
  jobId: string;
  title?: string;
  status?: string;
  docxFileKey?: string | null;
  pdfFileKey?: string | null;
  generatedAt?: string | null;
  sections?: LedDownloadSection[];
};

function statusBadge(status: LedStatus) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="default">Completed</Badge>;
    case "PROCESSING":
      return <Badge variant="secondary">Processing</Badge>;
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function normalizeStatus(status: string): LedStatus {
  const upper = status.toUpperCase();
  if (upper === "COMPLETED") return "COMPLETED";
  if (upper === "PROCESSING") return "PROCESSING";
  if (upper === "FAILED") return "FAILED";
  return "PENDING";
}

function buildProgress(status: LedStatus, explicit?: number) {
  if (typeof explicit === "number") return explicit;
  if (status === "COMPLETED") return 100;
  if (status === "PROCESSING") return 60;
  if (status === "FAILED") return 0;
  return 10;
}

function toAcademicYearId(year: number) {
  if (ACADEMIC_YEAR_BY_START_YEAR[year]) return ACADEMIC_YEAR_BY_START_YEAR[year];
  return ACADEMIC_YEAR_BY_START_YEAR[2024];
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

const METRIC_LABELS_ID: Record<string, string> = {
  active_study_programs_total: "Jumlah Program Studi Aktif",
  organization_units_total: "Jumlah Unit Organisasi",
  vmts_version: "Versi VMTS",
  supporting_evidence_total: "Jumlah Bukti Pendukung",
  applicants_total: "Jumlah Pendaftar",
  new_students_total: "Jumlah Mahasiswa Baru",
  active_students_total: "Jumlah Mahasiswa Aktif",
  dropout_rate_pct: "Persentase Putus Studi",
  student_achievements_total: "Jumlah Prestasi Mahasiswa",
  mbkm_students_total: "Jumlah Mahasiswa MBKM",
  permanent_lecturers_total: "Jumlah Dosen Tetap",
  non_permanent_lecturers_total: "Jumlah Dosen Tidak Tetap",
  masters_lecturers_total: "Jumlah Dosen Magister",
  doctoral_lecturers_total: "Jumlah Dosen Doktor",
  lecturer_certified_total: "Jumlah Dosen Bersertifikat",
  lecturer_student_ratio: "Rasio Dosen terhadap Mahasiswa",
  operational_budget: "Anggaran Operasional",
  research_budget: "Anggaran Penelitian",
  service_budget: "Anggaran Pengabdian",
  scholarship_budget: "Anggaran Beasiswa",
  classrooms_total: "Jumlah Ruang Kelas",
  labs_total: "Jumlah Laboratorium",
  library_collections_total: "Jumlah Koleksi Perpustakaan",
  internet_coverage_pct: "Persentase Cakupan Internet",
  obe_implemented_pct: "Persentase Implementasi OBE",
  rps_complete_pct: "Persentase Kelengkapan RPS",
  mbkm_courses_pct: "Persentase Mata Kuliah MBKM",
  research_grants_total: "Jumlah Hibah Penelitian",
  publications_total: "Jumlah Publikasi",
  scopus_total: "Jumlah Publikasi Scopus",
  ipr_total: "Jumlah HKI",
  citation_total: "Jumlah Sitasi",
  service_programs_total: "Jumlah Program Pengabdian",
  service_partners_total: "Jumlah Mitra Pengabdian",
  service_outputs_total: "Jumlah Luaran Pengabdian",
  avg_gpa: "Rata-rata IPK",
  avg_study_period_years: "Rata-rata Masa Studi (Tahun)",
  employment_wait_months: "Masa Tunggu Kerja (Bulan)",
  field_alignment_pct: "Persentase Kesesuaian Bidang Kerja",
  continuing_study_pct: "Persentase Studi Lanjut",
  iku_metrics_total: "Jumlah Metrik IKU",
};

function normalizeMetricKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function humanizeKey(key: string) {
  const normalizedKey = normalizeMetricKey(key);
  const translatedLabel = METRIC_LABELS_ID[normalizedKey];
  if (translatedLabel) return translatedLabel;

  return normalizedKey
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toDisplayValue(value: unknown) {
  if (typeof value === "number") return value.toLocaleString("id-ID");
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (value === null || value === undefined) return "-";
  return String(value);
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-");
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

function normalizeDocumentText(text: string) {
  return text.replace(/\r\n/g, "\n").trim();
}

function applyApprovedContentToSections(
  sections: LedDownloadSection[],
  approved: DraftVersion
) {
  const approvedText = normalizeDocumentText(approved.content);
  const criterionCode = approved.criterionNo ? `LED-C${approved.criterionNo}` : null;

  if (sections.length === 0) {
    return [
      {
        sectionCode: criterionCode ?? "LED-CUSTOM",
        sectionName: approved.label,
        sectionText: approvedText,
        evidenceBindings: [],
      },
    ];
  }

  if (criterionCode) {
    const hasMatchedCode = sections.some(
      (section) => section.sectionCode === criterionCode
    );

    if (hasMatchedCode) {
      return sections.map((section) =>
        section.sectionCode === criterionCode
          ? { ...section, sectionText: approvedText }
          : section
      );
    }
  }

  return sections.map((section, index) =>
    index === 0 ? { ...section, sectionText: approvedText } : section
  );
}

async function buildDocxBlob(title: string, sections: LedDownloadSection[]) {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${dateTimeFormatter.format(new Date())}`,
        }),
      ],
    }),
    new Paragraph({ text: "" }),
  ];

  sections.forEach((section) => {
    children.push(
      new Paragraph({
        text: `${section.sectionCode} - ${section.sectionName}`,
        heading: HeadingLevel.HEADING_1,
      })
    );

    const paragraphs = normalizeDocumentText(section.sectionText)
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      children.push(new Paragraph({ text: "-" }));
    } else {
      paragraphs.forEach((paragraph) => {
        children.push(new Paragraph({ children: [new TextRun(paragraph)] }));
      });
    }

    children.push(new Paragraph({ text: "" }));
  });

  const document = new Document({
    sections: [{ children }],
  });

  return Packer.toBlob(document);
}

async function buildPdfBlob(title: string, sections: LedDownloadSection[]) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (neededHeight = 18) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeTextBlock = (text: string, size: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);

    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    lines.forEach((line) => {
      ensureSpace(size + 6);
      doc.text(line, margin, y);
      y += size + 4;
    });
  };

  writeTextBlock(title, 16, true);
  y += 6;
  writeTextBlock(`Generated: ${dateTimeFormatter.format(new Date())}`, 10);
  y += 12;

  sections.forEach((section) => {
    writeTextBlock(`${section.sectionCode} - ${section.sectionName}`, 13, true);
    y += 6;

    const paragraphs = normalizeDocumentText(section.sectionText)
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      writeTextBlock("-", 11);
    } else {
      paragraphs.forEach((paragraph) => {
        writeTextBlock(paragraph, 11);
        y += 2;
      });
    }

    y += 10;
  });

  return doc.output("blob");
}

export default function LedPage() {
  const [workspaceJob, setWorkspaceJob] = useState<WorkspaceJob | null>(null);
  const [activeCriterion, setActiveCriterion] = useState<number | null>(null);
  const [loadingCriterion, setLoadingCriterion] = useState<number | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [workspaceTitle, setWorkspaceTitle] = useState("Belum ada draf LED");
  const [sourceFacts, setSourceFacts] = useState<SourceFact[]>([]);
  const [sourceStructuredData, setSourceStructuredData] = useState<
    Record<string, unknown>
  >({});
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [draftText, setDraftText] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<DraftComment[]>([]);
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [approvedVersionId, setApprovedVersionId] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<"docx" | "pdf" | null>(
    null
  );
  const [lastExportMessage, setLastExportMessage] = useState<string | null>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [format, setFormat] = useState<"docx" | "pdf">("docx");

  const approvedVersion = useMemo(
    () => versions.find((item) => item.id === approvedVersionId) ?? null,
    [versions, approvedVersionId]
  );

  function mapJob(payload: {
    jobId: string;
    status: string;
    progress?: number;
    startedAt?: string | null;
    finishedAt?: string | null;
  }) {
    const status = normalizeStatus(payload.status);
    return {
      jobId: payload.jobId,
      status,
      progress: buildProgress(status, payload.progress),
      createdAt: payload.startedAt ?? new Date().toISOString(),
      finishedAt: payload.finishedAt,
    } satisfies WorkspaceJob;
  }

  function hydrateWorkspace(data: LedStatusResponse, preferredCriterion?: number) {
    const firstOutput = data.outputs?.[0];
    const sections = firstOutput?.sectionOutputs ?? [];

    const targetSectionCode = preferredCriterion
      ? `LED-C${preferredCriterion}`
      : activeCriterion
        ? `LED-C${activeCriterion}`
        : null;

    const selectedSection =
      sections.find(
        (section) =>
          section.documentSection?.sectionCode &&
          section.documentSection.sectionCode === targetSectionCode
      ) ?? sections[0];

    setWorkspaceTitle(
      selectedSection?.documentSection?.sectionName ??
        firstOutput?.title ??
        "Belum ada draf LED"
    );

    if (!selectedSection) {
      setSourceFacts([]);
      setSourceStructuredData({});
      setEvidenceItems([]);
      setDraftText("");
      return;
    }

    const snapshot = toRecord(selectedSection.sourceSnapshot);
    const facts = toRecord(snapshot.facts);
    const structuredData = toRecord(snapshot.structuredData);
    const evidenceBindings = Array.isArray(snapshot.evidenceBindings)
      ? snapshot.evidenceBindings.filter(isRecord)
      : [];

    const factRows = Object.entries(facts).map(([key, value]) => ({
      key: humanizeKey(key),
      value: toDisplayValue(value),
    }));

    const mappedEvidence: EvidenceItem[] = evidenceBindings.map((item) => ({
      evidenceCode: String(item.evidenceCode ?? "-"),
      title: String(item.title ?? "Tanpa judul"),
      documentType: item.documentType ? String(item.documentType) : null,
      fileKey: item.fileKey ? String(item.fileKey) : null,
      fileName: item.fileName ? String(item.fileName) : null,
      criterionCode: item.criterionCode ? String(item.criterionCode) : null,
      mappingNote: item.mappingNote ? String(item.mappingNote) : null,
    }));

    setSourceFacts(factRows);
    setSourceStructuredData(structuredData);
    setEvidenceItems(mappedEvidence);
    setDraftText(selectedSection.sectionText ?? "");
    setComments([]);
    setVersions([]);
    setApprovedVersionId(null);
  }

  async function fetchStatus(jobId: string) {
    const response = await api.get<ApiEnvelope<LedStatusResponse>>(
      `/led/status/${jobId}`
    );
    return response.data.data;
  }

  async function waitForCompletion(jobId: string) {
    let attempts = 0;

    while (attempts < 12) {
      const statusData = await fetchStatus(jobId);
      const mappedJob = mapJob(statusData);
      setWorkspaceJob(mappedJob);

      if (mappedJob.status === "COMPLETED" || mappedJob.status === "FAILED") {
        return statusData;
      }

      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return fetchStatus(jobId);
  }

  async function handleGenerateCriterion(criterionNo: number) {
    setWorkspaceError(null);
    setLastExportMessage(null);
    setWorkspaceLoading(true);
    setLoadingCriterion(criterionNo);
    setActiveCriterion(criterionNo);

    try {
      const payload = {
        documentDefinitionId: DEFAULT_LED_DOCUMENT_DEFINITION_ID,
        institutionId: DEFAULT_INSTITUTION_ID,
        studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
        academicYearId: toAcademicYearId(year),
        criteria: [criterionNo],
        format,
        year,
        notes: `Generate Kriteria ${criterionNo} | Tahun: ${year} | Format: ${format}`,
      };

      const generated = await api.post<ApiEnvelope<LedGenerateResponse>>(
        "/led/generate",
        payload
      );

      const generatedJob = generated.data.data;
      setWorkspaceJob(
        mapJob({
          jobId: generatedJob.jobId,
          status: generatedJob.status,
          progress: generatedJob.progress,
          startedAt: generatedJob.startedAt,
          finishedAt: generatedJob.finishedAt,
        })
      );

      const statusData = await waitForCompletion(generatedJob.jobId);
      hydrateWorkspace(statusData, criterionNo);
    } catch {
      setWorkspaceError(
        "Gagal membuat draf LED untuk kriteria ini. Periksa koneksi backend atau autentikasi."
      );
    } finally {
      setWorkspaceLoading(false);
      setLoadingCriterion(null);
    }
  }

  async function handleRefreshWorkspace() {
    if (!workspaceJob) return;

    setWorkspaceError(null);
    setWorkspaceLoading(true);

    try {
      const statusData = await fetchStatus(workspaceJob.jobId);
      setWorkspaceJob(mapJob(statusData));
      hydrateWorkspace(statusData, activeCriterion ?? undefined);
    } catch {
      setWorkspaceError("Gagal memuat ulang status job LED.");
    } finally {
      setWorkspaceLoading(false);
    }
  }

  function handleAddComment() {
    if (!commentInput.trim()) return;

    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        text: commentInput.trim(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setCommentInput("");
  }

  function handleSaveVersion() {
    if (!draftText.trim()) {
      setWorkspaceError("Draf kosong. Isi editor sebelum menyimpan versi.");
      return;
    }

    const criterionLabel = activeCriterion ? `C${activeCriterion}` : "C?";
    const version: DraftVersion = {
      id: `v-${Date.now()}`,
      label: `v${versions.length + 1} - ${criterionLabel}`,
      content: draftText,
      createdAt: new Date().toISOString(),
      criterionNo: activeCriterion,
      jobId: workspaceJob?.jobId ?? null,
    };

    setVersions((prev) => [version, ...prev]);
    setWorkspaceError(null);
  }

  function handleApproveLatest() {
    if (versions.length === 0) {
      setWorkspaceError(
        "Belum ada versi tersimpan. Simpan versi terlebih dahulu sebelum approval."
      );
      return;
    }

    setApprovedVersionId(versions[0].id);
    setWorkspaceError(null);
  }

  function buildEvidenceUrl(fileKey: string | null) {
    if (!fileKey) return null;
    const base = process.env.NEXT_PUBLIC_MINIO_BASE_URL;
    if (!base) return null;
    return `${base.replace(/\/$/, "")}/${fileKey.replace(/^\//, "")}`;
  }

  async function handleExport(targetFormat: "docx" | "pdf") {
    if (!workspaceJob) {
      setWorkspaceError("Belum ada job LED yang bisa diekspor.");
      return;
    }

    if (!approvedVersion) {
      setWorkspaceError("Approval diperlukan sebelum ekspor dokumen final.");
      return;
    }

    setWorkspaceError(null);
    setExportingFormat(targetFormat);

    try {
      const response = await api.get<ApiEnvelope<LedDownloadResponse>>(
        `/led/download/${workspaceJob.jobId}`
      );

      const payload = response.data.data;
      const safeTitle = sanitizeFileName(payload.title ?? "LED-Workspace");
      const fileName = `${safeTitle}.${targetFormat}`;

      const sections = applyApprovedContentToSections(
        payload.sections ?? [],
        approvedVersion
      );

      if (targetFormat === "docx") {
        const blob = await buildDocxBlob(payload.title ?? "LED Workspace", sections);
        triggerDownload(blob, fileName);
      } else {
        const blob = await buildPdfBlob(payload.title ?? "LED Workspace", sections);
        triggerDownload(blob, fileName);
      }

      setLastExportMessage(
        `File ${targetFormat.toUpperCase()} berhasil diekspor dari versi draft yang sudah di-approval.`
      );
    } catch {
      setWorkspaceError("Gagal mengekspor dokumen LED.");
    } finally {
      setExportingFormat(null);
    }
  }

  function renderJobSummary() {
    if (!workspaceJob) {
      return (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Belum ada job aktif. Gunakan tombol Generate per Kriteria untuk memulai.
        </div>
      );
    }

    return (
      <div className="rounded-xl border bg-background/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Job Active</p>
            <p className="font-medium">{workspaceJob.jobId.slice(0, 8)}...</p>
          </div>
          {statusBadge(workspaceJob.status)}
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{workspaceJob.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${workspaceJob.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          Dibuat {dateTimeFormatter.format(new Date(workspaceJob.createdAt))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(249,115,22,0.18),transparent_30%)]" />

      <Card className="overflow-hidden border-none bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 text-slate-100 shadow-2xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge className="bg-cyan-500/25 text-cyan-100 hover:bg-cyan-500/25">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Document Command Center
              </Badge>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">LED Workspace</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-200/80">
                  Workspace generasi dokumen berorientasi pipeline: Retrieval dan
                  RAG, Prompting, Consistency Check, Evidence Binding, Human Review,
                  hingga Export final.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              <div className="space-y-2 rounded-xl bg-black/20 p-3 backdrop-blur">
                <Label className="text-slate-100">Tahun Akademik</Label>
                <Input
                  type="number"
                  className="border-white/20 bg-white/10 text-white placeholder:text-slate-300"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                />
              </div>
              <div className="space-y-2 rounded-xl bg-black/20 p-3 backdrop-blur">
                <Label className="text-slate-100">Format Prioritas</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={format}
                  onChange={(event) => setFormat(event.target.value as "docx" | "pdf")}
                >
                  <option value="docx" className="text-slate-900">
                    DOCX
                  </option>
                  <option value="pdf" className="text-slate-900">
                    PDF
                  </option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {workspaceError && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-2 pt-6 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">{workspaceError}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-4 w-4 text-cyan-600" />
                Generate per Kriteria
              </CardTitle>
              <CardDescription>
                Tombol aksi generation per bab LED. Setiap klik memanggil endpoint
                backend dengan payload kriteria spesifik.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {CRITERIA_OPTIONS.map((criterion) => {
                  const isActive = activeCriterion === criterion.no;
                  const isLoading = loadingCriterion === criterion.no;

                  return (
                    <div
                      key={criterion.no}
                      className={`rounded-xl border p-3 transition-all ${
                        isActive
                          ? "border-cyan-500 bg-cyan-500/5 shadow-sm"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="mb-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Kriteria {criterion.no}
                        </p>
                        <p className="text-sm font-medium">{criterion.label}</p>
                      </div>

                      <Button
                        size="sm"
                        className="w-full"
                        disabled={Boolean(loadingCriterion)}
                        onClick={() => handleGenerateCriterion(criterion.no)}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Kriteria {criterion.no}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {renderJobSummary()}
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-4 w-4 text-emerald-600" />
                    Panel Data Sumber
                  </CardTitle>
                  <CardDescription>
                    Data kuantitatif dari database sebagai referensi narasi.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshWorkspace}
                  disabled={!workspaceJob || workspaceLoading}
                >
                  {workspaceLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="facts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="facts">Ringkasan Kuantitatif</TabsTrigger>
                  <TabsTrigger value="snapshot">Structured Snapshot JSON</TabsTrigger>
                </TabsList>

                <TabsContent value="facts" className="mt-4">
                  {sourceFacts.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Belum ada data sumber. Generate salah satu kriteria untuk
                      memuat snapshot retrieval.
                    </p>
                  ) : (
                    <ScrollArea className="max-h-[330px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[45%]">Metric</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sourceFacts.map((row, index) => (
                            <TableRow key={`${row.key}-${index}`}>
                              <TableCell className="font-medium">{row.key}</TableCell>
                              <TableCell>{row.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </TabsContent>

                <TabsContent value="snapshot" className="mt-4">
                  <ScrollArea className="max-h-[330px] rounded-lg border bg-slate-950/95 p-3">
                    <pre className="text-xs leading-relaxed text-slate-100">
                      {JSON.stringify(sourceStructuredData, null, 2)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSearch className="h-4 w-4 text-indigo-600" />
                Panel Evidence (Bukti)
              </CardTitle>
              <CardDescription>
                Daftar bukti dokumen lampiran yang ditautkan otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evidenceItems.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Evidence belum tersedia untuk draf aktif.
                </p>
              ) : (
                <ScrollArea className="max-h-[280px]">
                  <div className="space-y-3">
                    {evidenceItems.map((item, index) => {
                      const href = buildEvidenceUrl(item.fileKey);
                      return (
                        <div
                          key={`${item.evidenceCode}-${index}`}
                          className="rounded-lg border bg-background p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{item.evidenceCode}</Badge>
                            {item.criterionCode && (
                              <Badge variant="secondary">{item.criterionCode}</Badge>
                            )}
                            {item.documentType && (
                              <Badge variant="secondary">{item.documentType}</Badge>
                            )}
                          </div>
                          <p className="mt-2 text-sm font-medium">{item.title}</p>
                          {item.mappingNote && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.mappingNote}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            {href ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline-offset-2 hover:underline"
                              >
                                Buka Dokumen Bukti
                              </a>
                            ) : (
                              <span className="text-muted-foreground">
                                File key: {item.fileKey ?? "-"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Review Workspace (Human in the Loop)
              </CardTitle>
              <CardDescription>
                {workspaceTitle} - editor draf AI, komentar, versioning, dan
                approval final.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="draft" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="draft">Draft Editor</TabsTrigger>
                  <TabsTrigger value="comments">Komentar ({comments.length})</TabsTrigger>
                  <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="draft" className="mt-4 space-y-3">
                  <Textarea
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                    className="min-h-[340px] resize-y leading-7"
                    placeholder="Draf narasi LED akan muncul di sini setelah generate."
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveVersion}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Version
                    </Button>
                    <Button size="sm" onClick={handleApproveLatest}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approval
                    </Button>
                    {approvedVersion && (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        Approved: {approvedVersion.label}
                      </Badge>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={commentInput}
                      onChange={(event) => setCommentInput(event.target.value)}
                      placeholder="Tambahkan komentar reviewer..."
                    />
                    <Button type="button" onClick={handleAddComment}>
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {comments.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Belum ada komentar review.
                    </p>
                  ) : (
                    <ScrollArea className="max-h-[260px]">
                      <div className="space-y-2">
                        {comments.map((comment) => (
                          <div key={comment.id} className="rounded-lg border p-3">
                            <p className="text-sm">{comment.text}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {dateTimeFormatter.format(new Date(comment.createdAt))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                <TabsContent value="versions" className="mt-4">
                  {versions.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Belum ada versi tersimpan.
                    </p>
                  ) : (
                    <ScrollArea className="max-h-[280px]">
                      <div className="space-y-2">
                        {versions.map((version) => (
                          <div
                            key={version.id}
                            className="flex items-center justify-between gap-3 rounded-lg border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{version.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {dateTimeFormatter.format(new Date(version.createdAt))}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {approvedVersionId === version.id && <Badge>Approved</Badge>}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setDraftText(version.content);
                                  setActiveCriterion(version.criterionNo);
                                }}
                              >
                                Load
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4 text-rose-600" />
                Export Dokumen Final
              </CardTitle>
              <CardDescription>
                Ekspor final dilakukan setelah versi draf disetujui.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Approval Status
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {approvedVersion ? approvedVersion.label : "Belum disetujui"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Job Status
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {workspaceJob ? workspaceJob.status : "Belum ada job"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleExport("docx")}
                  disabled={
                    exportingFormat !== null ||
                    !approvedVersion ||
                    !workspaceJob ||
                    workspaceJob.status !== "COMPLETED"
                  }
                >
                  {exportingFormat === "docx" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export DOCX
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleExport("pdf")}
                  disabled={
                    exportingFormat !== null ||
                    !approvedVersion ||
                    !workspaceJob ||
                    workspaceJob.status !== "COMPLETED"
                  }
                >
                  {exportingFormat === "pdf" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export PDF
                </Button>
              </div>

              {lastExportMessage && (
                <div className="rounded-lg border bg-emerald-50 p-3 text-sm text-emerald-700">
                  {lastExportMessage}
                </div>
              )}

              <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                Ekspor akan mengunduh file DOCX/PDF sesuai tombol yang dipilih.
                Jika file fisik sudah tersedia di storage maka file tersebut diunduh,
                jika belum maka file akan dibangkitkan langsung dari section output.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Draft</p>
          <p className="mt-1 text-lg font-semibold">{workspaceTitle}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Source Metrics</p>
          <p className="mt-1 text-lg font-semibold">{sourceFacts.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Evidence</p>
          <p className="mt-1 text-lg font-semibold">{evidenceItems.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Review</p>
          <p className="mt-1 text-lg font-semibold">
            {approvedVersion ? "Approved" : "Pending Approval"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed bg-card p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Catatan:</span> UI ini
        berfungsi sebagai kerangka Document-Generation-Centric Workspace dengan
        panel Generate, Data Sumber, Evidence, Review (comment/version/approval),
        dan Export.
      </div>

      {workspaceLoading && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-background px-4 py-3 shadow-xl">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses LED Workspace...
          </div>
        </div>
      )}
    </div>
  );
}
