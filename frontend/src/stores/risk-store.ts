import { create } from "zustand";
import api from "@/lib/api";
import type { RiskAlert, CreateRiskAlertRequest } from "@/lib/types";

interface RiskState {
  alerts: RiskAlert[];
  loading: boolean;
  error: string | null;

  fetchAlerts: (params?: {
    level?: string;
    isResolved?: boolean;
    criteriaNo?: number;
  }) => Promise<void>;
  createAlert: (data: CreateRiskAlertRequest) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

export const useRiskStore = create<RiskState>((set) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: RiskAlert[] }>("/risk/alerts", { params });
      set({ alerts: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch risk alerts", loading: false });
    }
  },

  createAlert: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/risk/alerts", data);
      const res = await api.get<{ data: RiskAlert[] }>("/risk/alerts");
      set({ alerts: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create alert", loading: false });
    }
  },

  resolveAlert: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/risk/alerts/${id}/resolve`);
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === id ? { ...a, isResolved: true } : a
        ),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to resolve alert", loading: false });
    }
  },
}));
