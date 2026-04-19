import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  active?: boolean;
  collapsed?: boolean;
}

export function NavItem({
  href,
  label,
  description,
  icon: Icon,
  active = false,
  collapsed = false,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
        collapsed && "justify-center px-2"
      )}
    >
      {active && <span className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-brand-accent" />}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-cardtitle leading-tight">{label}</p>
          <p className="truncate text-[11px] text-slate-500">{description}</p>
        </div>
      )}
    </Link>
  );
}
