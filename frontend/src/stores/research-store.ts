import { create } from "zustand";
import api from "@/lib/api";
import type {
  Publication,
  CreatePublicationRequest,
  ResearchGrant,
  CreateGrantRequest,
  Hki,
  CreateHkiRequest,
} from "@/lib/types";

type ResearchSummaryRow = {
  id: string;
  institutionId: string;
  studyProgramId?: string | null;
  academicYearId: string;
  grantsTotal?: number;
  publicationsTotal?: number;
  scopusTotal?: number;
  iprTotal?: number;
  citationTotal?: number;
};

type ResearchSummaryPayload = {
  institutionId: string;
  studyProgramId?: string;
  academicYearId: string;
  grantsTotal?: number;
  publicationsTotal?: number;
  scopusTotal?: number;
  iprTotal?: number;
  citationTotal?: number;
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

function mapToPublications(rows: ResearchSummaryRow[]): Publication[] {
  return rows.map((row) => {
    const year = START_YEAR_BY_ACADEMIC_YEAR_ID[row.academicYearId] ?? new Date().getFullYear();
    const publicationsTotal = row.publicationsTotal ?? 0;
    const scopusTotal = row.scopusTotal ?? 0;
    const citationTotal = row.citationTotal ?? 0;
    return {
      id: `pub-${row.id}`,
      title: `Ringkasan Publikasi ${year}`,
      journal: `Total publikasi: ${publicationsTotal}`,
      year,
      type: "JOURNAL",
      lecturerId: row.institutionId,
      sintaLevel: scopusTotal > 0 ? 1 : undefined,
      citations: citationTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

function mapToGrants(rows: ResearchSummaryRow[]): ResearchGrant[] {
  return rows.map((row) => {
    const year = START_YEAR_BY_ACADEMIC_YEAR_ID[row.academicYearId] ?? new Date().getFullYear();
    const grantsTotal = row.grantsTotal ?? 0;
    return {
      id: `grant-${row.id}`,
      title: `Pendanaan Penelitian ${year}`,
      source: "Ringkasan Institusi",
      amount: grantsTotal * 10000000,
      year,
      status: "COMPLETED",
      userId: row.institutionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

function mapToHki(rows: ResearchSummaryRow[]): Hki[] {
  return rows.map((row) => {
    const year = START_YEAR_BY_ACADEMIC_YEAR_ID[row.academicYearId] ?? new Date().getFullYear();
    const iprTotal = row.iprTotal ?? 0;
    return {
      id: `hki-${row.id}`,
      title: `HKI Tahun ${year}`,
      type: "Ringkasan",
      year,
      status: iprTotal > 0 ? "GRANTED" : "PENDING",
      regNumber: iprTotal > 0 ? `HKI-${year}-${iprTotal}` : undefined,
      userId: row.institutionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

interface ResearchState {
  publications: Publication[];
  grants: ResearchGrant[];
  hkiList: Hki[];
  loading: boolean;
  error: string | null;

  fetchPublications: (params?: {
    lecturerId?: string;
    year?: number;
    type?: string;
    sintaLevel?: number;
  }) => Promise<void>;
  createPublication: (data: CreatePublicationRequest) => Promise<void>;

  fetchGrants: (params?: {
    userId?: string;
    year?: number;
  }) => Promise<void>;
  createGrant: (data: CreateGrantRequest) => Promise<void>;

  fetchHki: (params?: {
    userId?: string;
    year?: number;
  }) => Promise<void>;
  createHki: (data: CreateHkiRequest) => Promise<void>;
}

export const useResearchStore = create<ResearchState>((set) => ({
  publications: [],
  grants: [],
  hkiList: [],
  loading: false,
  error: null,

  fetchPublications: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = {
        institutionId: DEFAULT_INSTITUTION_ID,
        ...(params ?? {}),
      };
      const res = await api.get<{ data: ResearchSummaryRow[] }>("/research", { params: mergedParams });
      const rows = res.data.data ?? [];
      set({ publications: mapToPublications(rows), loading: false });
    } catch {
      set({ error: "Failed to fetch publications", loading: false });
    }
  },

  createPublication: async (data) => {
    set({ loading: true, error: null });
    try {
      const payload: ResearchSummaryPayload = {
        institutionId: DEFAULT_INSTITUTION_ID,
        studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
        academicYearId: toAcademicYearId(data.year),
        grantsTotal: 0,
        publicationsTotal: 1,
        scopusTotal: data.sintaLevel ? 1 : 0,
        iprTotal: 0,
        citationTotal: data.citations ?? 0,
      };
      await api.post("/research", payload);
      const res = await api.get<{ data: ResearchSummaryRow[] }>("/research", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      const rows = res.data.data ?? [];
      set({ publications: mapToPublications(rows), loading: false });
    } catch {
      set({ error: "Failed to create publication", loading: false });
    }
  },

  fetchGrants: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = {
        institutionId: DEFAULT_INSTITUTION_ID,
        ...(params ?? {}),
      };
      const res = await api.get<{ data: ResearchSummaryRow[] }>("/research", { params: mergedParams });
      const rows = res.data.data ?? [];
      set({ grants: mapToGrants(rows), loading: false });
    } catch {
      set({ error: "Failed to fetch grants", loading: false });
    }
  },

  createGrant: async (data) => {
    set({ loading: true, error: null });
    try {
      const payload: ResearchSummaryPayload = {
        institutionId: DEFAULT_INSTITUTION_ID,
        studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
        academicYearId: toAcademicYearId(data.year),
        grantsTotal: Math.max(1, Math.round((data.amount ?? 0) / 10000000)),
        publicationsTotal: 0,
        scopusTotal: 0,
        iprTotal: 0,
        citationTotal: 0,
      };
      await api.post("/research", payload);
      const res = await api.get<{ data: ResearchSummaryRow[] }>("/research", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      const rows = res.data.data ?? [];
      set({ grants: mapToGrants(rows), loading: false });
    } catch {
      set({ error: "Failed to create grant", loading: false });
    }
  },

  fetchHki: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = {
        institutionId: DEFAULT_INSTITUTION_ID,
        ...(params ?? {}),
      };
      const res = await api.get<{ data: ResearchSummaryRow[] }>("/research", { params: mergedParams });
      const rows = res.data.data ?? [];
      set({ hkiList: mapToHki(rows), loading: false });
    } catch {
      set({ error: "Failed to fetch HKI", loading: false });
    }
  },

  createHki: async (data) => {
    set({ loading: true, error: null });
    try {
      const payload: ResearchSummaryPayload = {
        institutionId: DEFAULT_INSTITUTION_ID,
        studyProgramId: DEFAULT_STUDY_PROGRAM_ID,
        academicYearId: toAcademicYearId(data.year),
        grantsTotal: 0,
        publicationsTotal: 0,
        scopusTotal: 0,
        iprTotal: 1,
        citationTotal: 0,
      };
      await api.post("/research", payload);
      const res = await api.get<{ data: ResearchSummaryRow[] }>("/research", {
        params: { institutionId: DEFAULT_INSTITUTION_ID },
      });
      const rows = res.data.data ?? [];
      set({ hkiList: mapToHki(rows), loading: false });
    } catch {
      set({ error: "Failed to create HKI", loading: false });
    }
  },
}));
