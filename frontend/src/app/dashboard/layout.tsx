"use client";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopBar } from "@/components/ui/TopBar";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <TopBar />
        <main className="ml-[220px] pt-14">
          <div className="mx-auto w-full max-w-[1320px] px-6 py-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
