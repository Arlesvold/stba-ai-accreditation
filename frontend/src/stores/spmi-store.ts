import { create } from "zustand";
import api from "@/lib/api";
import type { SPMICycle, CreateSpmiRequest } from "@/lib/types";

interface SpmiState {
  cycles: SPMICycle[];
  loading: boolean;
  error: string | null;

  fetchAll: (params?: { year?: number; phase?: string }) => Promise<void>;
  create: (data: CreateSpmiRequest) => Promise<void>;
  update: (id: string, data: Partial<CreateSpmiRequest>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useSpmiStore = create<SpmiState>((set) => ({
  cycles: [],
  loading: false,
  error: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: SPMICycle[] }>("/spmi", { params });
      set({ cycles: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch SPMI cycles", loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/spmi", data);
      const res = await api.get<{ data: SPMICycle[] }>("/spmi");
      set({ cycles: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create SPMI cycle", loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/spmi/${id}`, data);
      const res = await api.get<{ data: SPMICycle[] }>("/spmi");
      set({ cycles: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to update SPMI cycle", loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/spmi/${id}`);
      set((state) => ({
        cycles: state.cycles.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete SPMI cycle", loading: false });
    }
  },
}));
