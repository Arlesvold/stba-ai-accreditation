import { create } from "zustand";
import api from "@/lib/api";
import type {
  Alumni,
  CreateAlumniRequest,
  StudentAchievement,
  CreateAchievementRequest,
  TracerStudySummary,
} from "@/lib/types";

type HttpError = { response?: { status?: number } };

type StudentsSummaryRow = {
  activeStudentsTotal?: number;
  studentAchievementsTotal?: number;
};

type GraduatesOutcomeRow = {
  employmentWaitMonths?: number | null;
  fieldAlignmentPct?: number | null;
};

const DEFAULT_INSTITUTION_ID =
  process.env.NEXT_PUBLIC_INSTITUTION_ID ??
  "a0000000-0000-0000-0000-000000000001";

const EMPTY_TRACER_SUMMARY: TracerStudySummary = {
  totalAlumni: 0,
  employed: 0,
  unemployed: 0,
  employmentRate: 0,
  avgWaitingMonths: 0,
};

function isNotFoundError(err: unknown) {
  return (err as HttpError)?.response?.status === 404;
}

interface StudentState {
  alumni: Alumni[];
  achievements: StudentAchievement[];
  tracerSummary: TracerStudySummary | null;
  loading: boolean;
  error: string | null;

  fetchAlumni: (params?: { graduationYear?: number; programStudy?: string }) => Promise<void>;
  createAlumni: (data: CreateAlumniRequest) => Promise<void>;
  removeAlumni: (id: string) => Promise<void>;
  fetchTracerSummary: (graduationYear?: number) => Promise<void>;

  fetchAchievements: (params?: { year?: number; category?: string }) => Promise<void>;
  createAchievement: (data: CreateAchievementRequest) => Promise<void>;
  removeAchievement: (id: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
  alumni: [],
  achievements: [],
  tracerSummary: null,
  loading: false,
  error: null,

  fetchAlumni: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: Alumni[] }>("/student/alumni", { params });
      set({ alumni: res.data.data, loading: false });
    } catch (err) {
      if (isNotFoundError(err)) {
        // Legacy endpoint removed in current backend schema; keep UI stable without hard error.
        set({ alumni: [], loading: false, error: null });
        return;
      }
      set({ error: "Failed to fetch alumni data", loading: false });
    }
  },

  createAlumni: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/student/alumni", data);
      const res = await api.get<{ data: Alumni[] }>("/student/alumni");
      set({ alumni: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create alumni", loading: false });
    }
  },

  removeAlumni: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/student/alumni/${id}`);
      set((state) => ({
        alumni: state.alumni.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete alumni", loading: false });
    }
  },

  fetchTracerSummary: async (graduationYear) => {
    try {
      const summaryParams = { institutionId: DEFAULT_INSTITUTION_ID };
      const graduatesParams = graduationYear
        ? { institutionId: DEFAULT_INSTITUTION_ID, graduationYear }
        : { institutionId: DEFAULT_INSTITUTION_ID };

      const [summaryRes, graduatesRes] = await Promise.all([
        api.get<{ data: StudentsSummaryRow[] }>("/student/summary", {
          params: summaryParams,
        }),
        api.get<{ data: GraduatesOutcomeRow[] }>("/student/graduates", {
          params: graduatesParams,
        }),
      ]);

      const summaries = summaryRes.data.data ?? [];
      const outcomes = graduatesRes.data.data ?? [];

      const totalAlumni = summaries.reduce(
        (sum, item) => sum + (item.activeStudentsTotal ?? 0),
        0,
      );

      const validRates = outcomes
        .map((item) => item.fieldAlignmentPct)
        .filter((value): value is number => typeof value === "number");

      const employmentRate = validRates.length
        ? validRates.reduce((sum, value) => sum + value, 0) / validRates.length
        : 0;

      const employed = Math.max(
        0,
        Math.min(totalAlumni, Math.round((employmentRate / 100) * totalAlumni)),
      );

      const validWaitingMonths = outcomes
        .map((item) => item.employmentWaitMonths)
        .filter((value): value is number => typeof value === "number");

      const avgWaitingMonths = validWaitingMonths.length
        ? validWaitingMonths.reduce((sum, value) => sum + value, 0) / validWaitingMonths.length
        : 0;

      set({
        tracerSummary: {
          totalAlumni,
          employed,
          unemployed: Math.max(totalAlumni - employed, 0),
          employmentRate,
          avgWaitingMonths,
        },
        // If legacy calls failed earlier, clear noisy error once summary can be built.
        error: null,
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        set({ tracerSummary: EMPTY_TRACER_SUMMARY, error: null });
        return;
      }
      set({ error: "Failed to fetch tracer study summary" });
    }
  },

  fetchAchievements: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: StudentAchievement[] }>("/student/achievements", { params });
      set({ achievements: res.data.data, loading: false });
    } catch (err) {
      if (isNotFoundError(err)) {
        // Legacy endpoint removed in current backend schema; keep UI stable without hard error.
        set({ achievements: [], loading: false, error: null });
        return;
      }
      set({ error: "Failed to fetch achievements", loading: false });
    }
  },

  createAchievement: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/student/achievements", data);
      const res = await api.get<{ data: StudentAchievement[] }>("/student/achievements");
      set({ achievements: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create achievement", loading: false });
    }
  },

  removeAchievement: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/student/achievements/${id}`);
      set((state) => ({
        achievements: state.achievements.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete achievement", loading: false });
    }
  },
}));
