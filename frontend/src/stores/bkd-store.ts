import { create } from "zustand";
import api from "@/lib/api";
import type { BkdReport, CreateBkdRequest } from "@/lib/types";

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
      const res = await api.get<{ data: BkdReport[] }>("/bkd", { params });
      set({ reports: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch BKD reports", loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/bkd", data);
      const res = await api.get<{ data: BkdReport[] }>("/bkd");
      set({ reports: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create BKD report", loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/bkd/${id}`, data);
      const res = await api.get<{ data: BkdReport[] }>("/bkd");
      set({ reports: res.data.data, loading: false });
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
