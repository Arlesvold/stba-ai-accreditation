import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClassName?: string;
  action: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  iconBgClassName,
  action,
  className,
}: SectionCardProps) {
  return (
    <article
      className={cn(
        "flex h-full min-h-[228px] flex-col rounded-2xl bg-brand-surfaceElevated p-6 shadow-sm ring-1 ring-slate-200 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:ring-brand-accent/40",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary",
            iconBgClassName
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div>
          <h3 className="text-cardtitle text-brand-textPrimary">{title}</h3>
          <p className="mt-2 text-body13 text-brand-textSecondary">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex justify-end pt-6">{action}</div>
    </article>
  );
}
