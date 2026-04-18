import { create } from "zustand";
import api from "@/lib/api";
import type { LedJob, GenerateLedRequest } from "@/lib/types";

type BackendLedGenerateResponse = {
  jobId: string;
  status: string;
  startedAt?: string;
};

type BackendLedStatusResponse = {
  jobId: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
};

type BackendLedDownloadResponse = {
  jobId: string;
  docxFileKey?: string | null;
  pdfFileKey?: string | null;
  title?: string;
};

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

function toAcademicYearId(year?: number) {
  if (year && ACADEMIC_YEAR_BY_START_YEAR[year]) {
    return ACADEMIC_YEAR_BY_START_YEAR[year];
  }
  return ACADEMIC_YEAR_BY_START_YEAR[2024];
}

function toStatus(status: string): LedJob["status"] {
  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED") return "COMPLETED";
  if (normalized === "PROCESSING") return "PROCESSING";
  if (normalized === "FAILED") return "FAILED";
  return "PENDING";
}

function progressFromStatus(status: LedJob["status"]) {
  if (status === "COMPLETED") return 100;
  if (status === "PROCESSING") return 55;
  if (status === "FAILED") return 0;
  return 10;
}

interface LedState {
  currentJob: LedJob | null;
  loading: boolean;
  error: string | null;

  generate: (data: GenerateLedRequest) => Promise<void>;
  checkStatus: (jobId: string) => Promise<void>;
  download: (jobId: string) => Promise<void>;
}

export const useLedStore = create<LedState>((set) => ({
  currentJob: null,
  loading: false,
  error: null,

  generate: async (data) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        documentDefinitionId: DEFAULT_LED_DOCUMENT_DEFINITION_ID,
        institutionId: DEFAULT_INSTITUTION_ID,
        studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
        academicYearId: toAcademicYearId(data.year),
        notes: `Generate LED | Criteria: ${data.criteria.join(",")} | Year: ${data.year} | Format: ${data.format ?? "docx"}`,
      };
      const res = await api.post<{ data: BackendLedGenerateResponse }>("/led/generate", payload);
      const status = toStatus(res.data.data.status);
      set({
        currentJob: {
          jobId: res.data.data.jobId,
          status,
          progress: progressFromStatus(status),
          createdAt: res.data.data.startedAt ?? new Date().toISOString(),
        },
        loading: false,
      });
    } catch {
      set({ error: "Failed to generate LED", loading: false });
    }
  },

  checkStatus: async (jobId) => {
    try {
      const res = await api.get<{ data: BackendLedStatusResponse }>(`/led/status/${jobId}`);
      const status = toStatus(res.data.data.status);
      set({
        currentJob: {
          jobId: res.data.data.jobId,
          status,
          progress: progressFromStatus(status),
          createdAt:
            res.data.data.startedAt ??
            res.data.data.finishedAt ??
            new Date().toISOString(),
        },
      });
    } catch {
      set({ error: "Failed to check status" });
    }
  },

  download: async (jobId) => {
    try {
      const res = await api.get<{ data: BackendLedDownloadResponse }>(`/led/download/${jobId}`);
      const fileInfo = res.data.data;
      const blob = new Blob([JSON.stringify(fileInfo, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = (fileInfo.title ?? `LED-${jobId}`)
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-") || `LED-${jobId}`;
      link.download = `${baseName}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      set({ error: null });
    } catch {
      set({ error: "Failed to download LED" });
    }
  },
}));
