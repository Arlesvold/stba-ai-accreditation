import { create } from "zustand";
import axios from "axios";
import api, { API_URL } from "@/lib/api";
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
      let message = "Login failed";

      if (axios.isAxiosError(err)) {
        if (err.code === "ERR_NETWORK") {
          message = `Tidak bisa terhubung ke server API (${API_URL}). Jalankan backend terlebih dahulu.`;
        } else {
          const responseMessage = err.response?.data as { message?: string } | undefined;
          message = responseMessage?.message ?? message;
        }
      }

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
