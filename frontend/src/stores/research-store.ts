import { create } from "zustand";
import api from "@/lib/api";
import type {
  Publication,
  CreatePublicationRequest,
  ResearchGrant,
  CreateGrantRequest,
  Hki,
  CreateHkiRequest,
} from "@/lib/types";

interface ResearchState {
  publications: Publication[];
  grants: ResearchGrant[];
  hkiList: Hki[];
  loading: boolean;
  error: string | null;

  fetchPublications: (params?: {
    lecturerId?: string;
    year?: number;
    type?: string;
    sintaLevel?: number;
  }) => Promise<void>;
  createPublication: (data: CreatePublicationRequest) => Promise<void>;

  fetchGrants: (params?: {
    userId?: string;
    year?: number;
  }) => Promise<void>;
  createGrant: (data: CreateGrantRequest) => Promise<void>;

  fetchHki: (params?: {
    userId?: string;
    year?: number;
  }) => Promise<void>;
  createHki: (data: CreateHkiRequest) => Promise<void>;
}

export const useResearchStore = create<ResearchState>((set) => ({
  publications: [],
  grants: [],
  hkiList: [],
  loading: false,
  error: null,

  fetchPublications: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: Publication[] }>("/research/publications", { params });
      set({ publications: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch publications", loading: false });
    }
  },

  createPublication: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/research/publications", data);
      const res = await api.get<{ data: Publication[] }>("/research/publications");
      set({ publications: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create publication", loading: false });
    }
  },

  fetchGrants: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: ResearchGrant[] }>("/research/grants", { params });
      set({ grants: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch grants", loading: false });
    }
  },

  createGrant: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/research/grants", data);
      const res = await api.get<{ data: ResearchGrant[] }>("/research/grants");
      set({ grants: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create grant", loading: false });
    }
  },

  fetchHki: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ data: Hki[] }>("/research/hki", { params });
      set({ hkiList: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to fetch HKI", loading: false });
    }
  },

  createHki: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/research/hki", data);
      const res = await api.get<{ data: Hki[] }>("/research/hki");
      set({ hkiList: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to create HKI", loading: false });
    }
  },
}));
