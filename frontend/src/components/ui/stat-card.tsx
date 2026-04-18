import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  progress: number;
  className?: string;
}

export function StatCard({ value, label, progress, className }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl bg-brand-surfaceCard p-6", className)}>
      <p className="text-[32px] font-bold leading-none text-brand-textPrimary">{value}</p>
      <p className="mt-2 text-label11 uppercase tracking-[0.12em] text-brand-textMuted">{label}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-accent"
          style={{ width: `${Math.max(6, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}
