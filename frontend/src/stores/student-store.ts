import { create } from "zustand";
import api from "@/lib/api";
import type {
  Alumni,
  CreateAlumniRequest,
  StudentAchievement,
  CreateAchievementRequest,
  TracerStudySummary,
} from "@/lib/types";

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
    } catch {
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
      const params = graduationYear ? { graduationYear } : undefined;
      const res = await api.get<{ data: TracerStudySummary }>("/student/alumni/tracer-summary", { params });
      set({ tracerSummary: res.data.data });
    } catch {
      set({ error: "Failed to fetch tracer study summary" });
    }
  },

  fetchAchievements: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: StudentAchievement[] }>("/student/achievements", { params });
      set({ achievements: res.data.data, loading: false });
    } catch {
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
