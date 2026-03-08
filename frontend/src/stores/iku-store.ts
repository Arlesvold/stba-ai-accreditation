import { create } from "zustand";
import api from "@/lib/api";
import type { IkuData, CreateIkuRequest, UpdateIkuRequest } from "@/lib/types";

interface IkuState {
  items: IkuData[];
  loading: boolean;
  error: string | null;

  fetchAll: (params?: {
    year?: number;
    criteria?: number;
    semester?: string;
  }) => Promise<void>;
  create: (data: CreateIkuRequest) => Promise<void>;
  update: (id: string, data: UpdateIkuRequest) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useIkuStore = create<IkuState>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: IkuData[] }>("/iku", { params });
      set({ items: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch IKU data", loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/iku", data);
      const res = await api.get<{ data: IkuData[] }>("/iku");
      set({ items: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create IKU", loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/iku/${id}`, data);
      const res = await api.get<{ data: IkuData[] }>("/iku");
      set({ items: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to update IKU", loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/iku/${id}`);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to delete IKU", loading: false });
    }
  },
}));
