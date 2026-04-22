import { create } from "zustand";
import axios from "axios";
import api from "@/lib/api";
import type {
  CreateScoreRequest,
  AccreditationReadiness,
  UpdateScoreRequest,
} from "@/lib/types";

type StoreActionResult = {
  success: boolean;
  message: string;
};

function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const payload = error.response?.data as { message?: string | string[] } | undefined;
  if (!payload) {
    return fallback;
  }

  if (Array.isArray(payload.message) && payload.message.length > 0) {
    return payload.message[0] ?? fallback;
  }

  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message;
  }

  return fallback;
}

interface AccreditationState {
  readiness: AccreditationReadiness | null;
  loading: boolean;
  error: string | null;

  fetchReadiness: (year?: number) => Promise<void>;
  createScore: (data: CreateScoreRequest) => Promise<StoreActionResult>;
  updateScore: (id: string, data: UpdateScoreRequest) => Promise<void>;
}

export const useAccreditationStore = create<AccreditationState>((set, get) => ({
  readiness: null,
  loading: false,
  error: null,

  fetchReadiness: async (year) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: AccreditationReadiness }>(
        "/v1/accreditation/readiness",
        {
          params: typeof year === "number" ? { year } : undefined,
        }
      );
      set({ readiness: res.data.data, loading: false });
    } catch (error) {
      set({
        error: resolveApiErrorMessage(error, "Failed to fetch readiness"),
        loading: false,
      });
    }
  },

  createScore: async (data) => {
    set({ loading: true, error: null });
    try {
      const createRes = await api.post<{ message?: string }>(
        "/v1/accreditation/scores",
        data
      );
      const targetYear = data.year ?? get().readiness?.year;
      const res = await api.get<{ data: AccreditationReadiness }>(
        "/v1/accreditation/readiness",
        {
          params: typeof targetYear === "number" ? { year: targetYear } : undefined,
        }
      );
      set({ readiness: res.data.data, loading: false });
      return {
        success: true,
        message:
          createRes.data.message ?? "Skor akreditasi berhasil ditambahkan",
      };
    } catch (error) {
      const message = resolveApiErrorMessage(error, "Failed to create score");
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  updateScore: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/v1/accreditation/scores/${id}`, data);
      const targetYear = get().readiness?.year;
      const res = await api.get<{ data: AccreditationReadiness }>(
        "/v1/accreditation/readiness",
        {
          params: typeof targetYear === "number" ? { year: targetYear } : undefined,
        }
      );
      set({ readiness: res.data.data, loading: false });
    } catch (error) {
      set({
        error: resolveApiErrorMessage(error, "Failed to update score"),
        loading: false,
      });
    }
  },
}));
