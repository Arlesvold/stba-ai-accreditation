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
      const institutionId =
        process.env.NEXT_PUBLIC_INSTITUTION_ID ??
        "a0000000-0000-0000-0000-000000000001";

      const res = await api.get<{
        data: {
          percentage?: number;
          grade?: string;
          vmtsReady?: boolean;
          documentDefinitions?: number;
          evidenceUploaded?: number;
        };
      }>(`/accreditation/readiness/${institutionId}`, {
        params: year ? { year } : undefined,
      });

      const raw = res.data.data;
      const vmtsScore = raw.vmtsReady ? 34 : 0;
      const defsScore = Math.min((raw.documentDefinitions ?? 0) * 2, 33);
      const evidenceScore = Math.min((raw.evidenceUploaded ?? 0) * 6, 33);
      const computedPercentage = Math.round(vmtsScore + defsScore + evidenceScore);
      const percentage =
        typeof raw.percentage === "number" && !Number.isNaN(raw.percentage)
          ? Math.max(0, Math.min(100, Math.round(raw.percentage)))
          : Math.max(0, Math.min(100, computedPercentage));

      const grade =
        raw.grade ??
        (percentage >= 85
          ? "Baik Sekali"
          : percentage >= 70
            ? "Baik"
            : percentage >= 55
              ? "Cukup"
              : "Perlu Peningkatan");

      const normalized: AccreditationReadiness = {
        totalScore: percentage,
        maxScore: 100,
        percentage,
        grade,
        scores: [],
        vmtsReady: Boolean(raw.vmtsReady),
        documentDefinitions: raw.documentDefinitions ?? 0,
        evidenceUploaded: raw.evidenceUploaded ?? 0,
      };

      set({ readiness: normalized, loading: false });
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
