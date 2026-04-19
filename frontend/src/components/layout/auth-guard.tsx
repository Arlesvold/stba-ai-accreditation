"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, initialized, initializeAuth, fetchProfile, user } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!user) {
      fetchProfile();
    }
  }, [initialized, isAuthenticated, user, fetchProfile, router]);

  if (!initialized || !isAuthenticated) return null;

  return <>{children}</>;
}
