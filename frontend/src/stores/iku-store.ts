import { create } from "zustand";
import api from "@/lib/api";
import type { IkuData, CreateIkuRequest, UpdateIkuRequest } from "@/lib/types";

type IkuBackendRow = {
  id: string;
  institutionId: string;
  studyProgramId?: string | null;
  academicYearId: string;
  ikuCode: string;
  valueNumeric: number;
  unit?: string | null;
  sourceUnitId?: string | null;
  validationStatus?: string | null;
};

type IkuBackendPayload = {
  institutionId: string;
  studyProgramId?: string;
  academicYearId: string;
  ikuCode: string;
  valueNumeric: number;
  unit?: string;
  sourceUnitId?: string;
  validationStatus?: string;
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
  if (year && ACADEMIC_YEAR_BY_START_YEAR[year]) return ACADEMIC_YEAR_BY_START_YEAR[year];
  return ACADEMIC_YEAR_BY_START_YEAR[2024];
}

function toIkuCode(criteriaNo: number) {
  const no = Math.max(1, Math.min(9, Number(criteriaNo) || 1));
  return `IKU-${no}`;
}

function toCriteriaNo(ikuCode: string) {
  const match = ikuCode.match(/(\d+)/);
  if (!match) return 1;
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? 1 : Math.max(1, Math.min(9, parsed));
}

function toStatus(valueNumeric: number) {
  if (valueNumeric >= 85) return "EXCELLENT";
  if (valueNumeric >= 70) return "GOOD";
  return "NEEDS_IMPROVEMENT";
}

function mapBackendToIku(item: IkuBackendRow): IkuData {
  const criteriaNo = toCriteriaNo(item.ikuCode);
  const current = Number(item.valueNumeric) || 0;
  const target = 100;
  const percentage = Math.max(0, Math.min(100, Math.round(current)));
  const year = START_YEAR_BY_ACADEMIC_YEAR_ID[item.academicYearId] ?? new Date().getFullYear();

  return {
    id: item.id,
    criteriaNo,
    indicator: `Indikator ${item.ikuCode}`,
    target,
    current,
    percentage,
    status: toStatus(current),
    year,
    semester: item.unit ?? undefined,
    notes: item.validationStatus ?? undefined,
    createdAt: "",
    updatedAt: "",
  };
}

function mapFormToPayload(data: CreateIkuRequest): IkuBackendPayload {
  const target = Number(data.target) || 0;
  const current = Number(data.current) || 0;
  const valueNumeric = target > 0 ? (current / target) * 100 : 0;

  return {
    institutionId: DEFAULT_INSTITUTION_ID,
    studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
    academicYearId: toAcademicYearId(data.year),
    ikuCode: toIkuCode(data.criteriaNo),
    valueNumeric,
    unit: data.semester || "%",
    validationStatus: "PENDING",
  };
}

interface IkuState {
  items: IkuData[];
  loading: boolean;
  error: string | null;

  fetchAll: (params?: {
    year?: number;
    criteria?: number;
    semester?: string;
  }) => Promise<void>;
  create: (data: CreateIkuRequest) => Promise<void>;
  update: (id: string, data: UpdateIkuRequest) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useIkuStore = create<IkuState>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = {
        institutionId: DEFAULT_INSTITUTION_ID,
        ...(params?.year ? { academicYearId: toAcademicYearId(params.year) } : {}),
      };
      const res = await api.get<{ data: IkuBackendRow[] }>("/iku", { params: mergedParams });
      set({ items: (res.data.data ?? []).map(mapBackendToIku), loading: false });
    } catch {
      set({ error: "Failed to fetch IKU data", loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/iku", mapFormToPayload(data));
      const res = await api.get<{ data: IkuBackendRow[] }>("/iku", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      set({ items: (res.data.data ?? []).map(mapBackendToIku), loading: false });
    } catch {
      set({ error: "Failed to create IKU", loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/iku/${id}`, mapFormToPayload(data as CreateIkuRequest));
      const res = await api.get<{ data: IkuBackendRow[] }>("/iku", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      set({ items: (res.data.data ?? []).map(mapBackendToIku), loading: false });
    } catch {
      set({ error: "Failed to update IKU", loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/iku/${id}`);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete IKU", loading: false });
    }
  },
}));
