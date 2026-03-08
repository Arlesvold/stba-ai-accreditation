import { create } from "zustand";
import api from "@/lib/api";
import type {
  AccreditationReadiness,
  CreateScoreRequest,
  UpdateScoreRequest,
} from "@/lib/types";

interface AccreditationState {
  readiness: AccreditationReadiness | null;
  loading: boolean;
  error: string | null;

  fetchReadiness: (year?: number) => Promise<void>;
  createScore: (data: CreateScoreRequest) => Promise<void>;
  updateScore: (id: string, data: UpdateScoreRequest) => Promise<void>;
}

export const useAccreditationStore = create<AccreditationState>((set) => ({
  readiness: null,
  loading: false,
  error: null,

  fetchReadiness: async (year) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: AccreditationReadiness }>(
        "/accreditation/readiness",
        { params: year ? { year } : undefined }
      );
      set({ readiness: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch readiness", loading: false });
    }
  },

  createScore: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/accreditation/scores", data);
      // Refresh readiness after creating
      const res = await api.get<{ data: AccreditationReadiness }>(
        "/accreditation/readiness"
      );
      set({ readiness: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create score", loading: false });
    }
  },

  updateScore: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/accreditation/scores/${id}`, data);
      const res = await api.get<{ data: AccreditationReadiness }>(
        "/accreditation/readiness"
      );
      set({ readiness: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to update score", loading: false });
    }
  },
}));
