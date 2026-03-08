import { create } from "zustand";
import api from "@/lib/api";
import type { LedJob, GenerateLedRequest } from "@/lib/types";

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
      const res = await api.post<{ data: LedJob }>("/led/generate", data);
      set({ currentJob: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to generate LED", loading: false });
    }
  },

  checkStatus: async (jobId) => {
    try {
      const res = await api.get<{ data: LedJob }>(`/led/status/${jobId}`);
      set({ currentJob: res.data.data });
    } catch {
      set({ error: "Failed to check status" });
    }
  },

  download: async (jobId) => {
    try {
      const res = await api.get(`/led/download/${jobId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `LED-${jobId}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      set({ error: "Failed to download LED" });
    }
  },
}));
