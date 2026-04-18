import { create } from "zustand";
import api from "@/lib/api";
import type { Cooperation, CreateCooperationRequest } from "@/lib/types";

type CooperationBackendRow = {
  id: string;
  institutionId: string;
  studyProgramId?: string | null;
  academicYearId: string;
  programsTotal?: number;
  partnersTotal?: number;
  outputsTotal?: number;
  academicYear?: {
    yearLabel?: string;
    startDate?: string;
    endDate?: string;
  } | null;
};

type CooperationBackendPayload = {
  institutionId: string;
  studyProgramId?: string;
  academicYearId: string;
  programsTotal?: number;
  partnersTotal?: number;
  outputsTotal?: number;
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

function toAcademicYearIdFromDate(startDate?: string) {
  if (startDate) {
    const year = new Date(startDate).getFullYear();
    if (ACADEMIC_YEAR_BY_START_YEAR[year]) return ACADEMIC_YEAR_BY_START_YEAR[year];
  }
  return ACADEMIC_YEAR_BY_START_YEAR[2024];
}

function mapBackendToCooperation(item: CooperationBackendRow): Cooperation {
  const label = item.academicYear?.yearLabel ?? item.academicYearId;
  const programsTotal = item.programsTotal ?? 0;
  const partnersTotal = item.partnersTotal ?? 0;
  const outputsTotal = item.outputsTotal ?? 0;

  return {
    id: item.id,
    partnerName: "STBA Collaboration Network",
    partnerType: "Institutional",
    scope: "NATIONAL",
    title: `Ringkasan Kerjasama ${label}`,
    description: `Program: ${programsTotal} | Mitra: ${partnersTotal} | Output: ${outputsTotal}`,
    startDate: item.academicYear?.startDate ?? new Date().toISOString(),
    endDate: item.academicYear?.endDate,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapFormToBackendPayload(data: CreateCooperationRequest): CooperationBackendPayload {
  const outputs = data.description && data.description.trim().length > 0 ? 1 : 0;
  return {
    institutionId: DEFAULT_INSTITUTION_ID,
    studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
    academicYearId: toAcademicYearIdFromDate(data.startDate),
    programsTotal: 1,
    partnersTotal: 1,
    outputsTotal: outputs,
  };
}

interface CooperationState {
  cooperations: Cooperation[];
  loading: boolean;
  error: string | null;

  fetchAll: (params?: { scope?: string; status?: string }) => Promise<void>;
  create: (data: CreateCooperationRequest) => Promise<void>;
  update: (id: string, data: Partial<CreateCooperationRequest>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCooperationStore = create<CooperationState>((set) => ({
  cooperations: [],
  loading: false,
  error: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = {
        institutionId: DEFAULT_INSTITUTION_ID,
        ...(params ?? {}),
      };
      const res = await api.get<{ data: CooperationBackendRow[] }>("/cooperation", { params: mergedParams });
      set({ cooperations: (res.data.data ?? []).map(mapBackendToCooperation), loading: false });
    } catch {
      set({ error: "Failed to fetch cooperations", loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/cooperation", mapFormToBackendPayload(data));
      const res = await api.get<{ data: CooperationBackendRow[] }>("/cooperation", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      set({ cooperations: (res.data.data ?? []).map(mapBackendToCooperation), loading: false });
    } catch {
      set({ error: "Failed to create cooperation", loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/cooperation/${id}`, mapFormToBackendPayload(data as CreateCooperationRequest));
      const res = await api.get<{ data: CooperationBackendRow[] }>("/cooperation", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      set({ cooperations: (res.data.data ?? []).map(mapBackendToCooperation), loading: false });
    } catch {
      set({ error: "Failed to update cooperation", loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/cooperation/${id}`);
      set((state) => ({
        cooperations: state.cooperations.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete cooperation", loading: false });
    }
  },
}));
