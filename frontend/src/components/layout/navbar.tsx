"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const APP_NAME = "AI Accreditation Intelligence System";

interface NavbarProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export function Navbar({ sidebarCollapsed, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const profile = user as { name?: string; fullName?: string; email?: string } | null;
  const displayName = profile?.fullName ?? profile?.name ?? "Administrator";

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200 bg-white px-6 transition-all duration-300",
        sidebarCollapsed
          ? "left-[var(--sidebar-collapsed-width)]"
          : "left-[var(--sidebar-width)]",
        "right-0"
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-[20px] font-semibold leading-none text-brand-textPrimary">{APP_NAME}</h1>
          <p className="text-xs text-brand-textMuted">Document Intelligence Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-accent" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto rounded-xl px-2 py-1 hover:bg-slate-100">
              <div className="mr-3 text-right leading-tight">
                <p className="text-sm font-medium text-slate-700">{displayName}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-brand-primary text-sm font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {profile?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
