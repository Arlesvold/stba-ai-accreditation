"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchProfile, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
