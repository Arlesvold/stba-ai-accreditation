import { create } from "zustand";
import api from "@/lib/api";
import type { Cooperation, CreateCooperationRequest } from "@/lib/types";

interface CooperationState {
  cooperations: Cooperation[];
  loading: boolean;
  error: string | null;

  fetchAll: (params?: { scope?: string; status?: string }) => Promise<void>;
  create: (data: CreateCooperationRequest) => Promise<void>;
  update: (id: string, data: Partial<CreateCooperationRequest>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCooperationStore = create<CooperationState>((set) => ({
  cooperations: [],
  loading: false,
  error: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: Cooperation[] }>("/cooperation", { params });
      set({ cooperations: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch cooperations", loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/cooperation", data);
      const res = await api.get<{ data: Cooperation[] }>("/cooperation");
      set({ cooperations: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create cooperation", loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/cooperation/${id}`, data);
      const res = await api.get<{ data: Cooperation[] }>("/cooperation");
      set({ cooperations: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to update cooperation", loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/cooperation/${id}`);
      set((state) => ({
        cooperations: state.cooperations.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete cooperation", loading: false });
    }
  },
}));
