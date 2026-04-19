import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  barPercent: number;
  barColor?: string;
}

export function StatCard({ label, value, barPercent, barColor = "#2563EB" }: StatCardProps) {
  const pct = Math.max(0, Math.min(100, Number(barPercent) || 0));

  return (
    <div className="rounded-card border border-[#E2E8F0] bg-white px-5 py-4">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">
        {label}
      </p>
      <p className="mb-2.5 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#0F172A]">{value}</p>
      <div className="h-[3px] rounded-full bg-[#F1F5F9]">
        <div className={cn("h-full rounded-full")} style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}
