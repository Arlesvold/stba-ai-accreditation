import { create } from "zustand";
import api from "@/lib/api";
import type { User, LoginRequest, AuthTokens } from "@/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;

  initializeAuth: () => void;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,

  initializeAuth: () => {
    if (typeof window === "undefined") {
      set({ initialized: true });
      return;
    }

    const hasToken = Boolean(localStorage.getItem("accessToken"));
    set({ isAuthenticated: hasToken, initialized: true });
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ data: AuthTokens }>("/auth/login", data);
      const { accessToken, refreshToken } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      set({ isAuthenticated: true, initialized: true, loading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed";
      set({ error: message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false, initialized: true });
  },

  fetchProfile: async () => {
    try {
      const res = await api.get<{ data: User }>("/auth/profile");
      set({ user: res.data.data, isAuthenticated: true, initialized: true });
    } catch {
      set({ user: null, isAuthenticated: false, initialized: true });
    }
  },

  clearError: () => set({ error: null }),
}));
