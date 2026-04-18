import { create } from "zustand";
import api from "@/lib/api";
import type { BkdReport, CreateBkdRequest } from "@/lib/types";

type BkdBackendRow = {
  id: string;
  institutionId: string;
  studyProgramId?: string;
  academicYearId: string;
  permanentCount?: number;
  nonPermanentCount?: number;
  mastersCount?: number;
  doctoralCount?: number;
  professorCount?: number;
  associateProfessorCount?: number;
  lecturerCertifiedCount?: number;
};

type BkdBackendPayload = {
  institutionId: string;
  studyProgramId?: string;
  academicYearId: string;
  permanentCount?: number;
  nonPermanentCount?: number;
  mastersCount?: number;
  doctoralCount?: number;
  professorCount?: number;
  associateProfessorCount?: number;
  lecturerCertifiedCount?: number;
};

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

const START_YEAR_BY_ACADEMIC_YEAR_ID: Record<string, number> = Object.entries(
  ACADEMIC_YEAR_BY_START_YEAR,
).reduce<Record<string, number>>((acc, [year, id]) => {
  acc[id] = Number(year);
  return acc;
}, {});

function toAcademicYearId(year?: number) {
  if (year && ACADEMIC_YEAR_BY_START_YEAR[year]) {
    return ACADEMIC_YEAR_BY_START_YEAR[year];
  }
  return ACADEMIC_YEAR_BY_START_YEAR[2024];
}

function toInt(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.round(value));
}

function mapBackendToReport(item: BkdBackendRow): BkdReport {
  const year = START_YEAR_BY_ACADEMIC_YEAR_ID[item.academicYearId] ?? new Date().getFullYear();
  return {
    id: item.id,
    userId: item.institutionId,
    user: { id: item.studyProgramId ?? "", name: "Ringkasan Dosen" },
    semester: "Tahunan",
    year,
    teachingHours: item.permanentCount ?? 0,
    researchHours: item.mastersCount ?? 0,
    serviceHours: item.doctoralCount ?? 0,
    totalCredits: item.lecturerCertifiedCount ?? 0,
    status: "VERIFIED",
    createdAt: "",
    updatedAt: "",
  };
}

function mapFormToBackendPayload(data: CreateBkdRequest): BkdBackendPayload {
  return {
    institutionId: DEFAULT_INSTITUTION_ID,
    studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
    academicYearId: toAcademicYearId(data.year),
    permanentCount: toInt(data.teachingHours),
    nonPermanentCount: toInt(data.serviceHours),
    mastersCount: toInt(data.researchHours),
    doctoralCount: toInt(data.totalCredits),
    professorCount: 0,
    associateProfessorCount: 0,
    lecturerCertifiedCount: toInt(data.totalCredits),
  };
}

interface BkdState {
  reports: BkdReport[];
  loading: boolean;
  error: string | null;

  fetchAll: (params?: { userId?: string; year?: number }) => Promise<void>;
  create: (data: CreateBkdRequest) => Promise<void>;
  update: (id: string, data: Partial<CreateBkdRequest>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useBkdStore = create<BkdState>((set) => ({
  reports: [],
  loading: false,
  error: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = {
        institutionId: DEFAULT_INSTITUTION_ID,
        ...(params ?? {}),
      };
      const res = await api.get<{ data: BkdBackendRow[] }>("/bkd", { params: mergedParams });
      set({ reports: (res.data.data ?? []).map(mapBackendToReport), loading: false });
    } catch {
      set({ error: "Failed to fetch BKD reports", loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/bkd", mapFormToBackendPayload(data));
      const res = await api.get<{ data: BkdBackendRow[] }>("/bkd", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      set({ reports: (res.data.data ?? []).map(mapBackendToReport), loading: false });
    } catch {
      set({ error: "Failed to create BKD report", loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/bkd/${id}`, mapFormToBackendPayload(data as CreateBkdRequest));
      const res = await api.get<{ data: BkdBackendRow[] }>("/bkd", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      set({ reports: (res.data.data ?? []).map(mapBackendToReport), loading: false });
    } catch {
      set({ error: "Failed to update BKD report", loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/bkd/${id}`);
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete BKD report", loading: false });
    }
  },
}));
