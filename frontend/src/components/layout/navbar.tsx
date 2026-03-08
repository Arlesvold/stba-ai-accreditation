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
import { Menu, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/iku": "IKU Management",
  "/dashboard/research": "Research",
  "/dashboard/accreditation": "Accreditation",
  "/dashboard/risk": "Risk Alerts",
  "/dashboard/led": "LED Documents",
  "/dashboard/users": "User Management",
};

interface NavbarProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export function Navbar({ sidebarCollapsed, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      path === "/dashboard" ? pathname === path : pathname.startsWith(path)
    )?.[1] ?? "Dashboard";

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-6 backdrop-blur-sm transition-all duration-300",
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
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.name ?? "User"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email}
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
    </header>
  );
}
