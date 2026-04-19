interface ReadinessRingProps {
  percent: number;
  status: string;
}

export function ReadinessRing({ percent, status }: ReadinessRingProps) {
  const safePercent = isNaN(percent) ? 0 : percent;
  const pct = Number(safePercent) || 0;
  const clamped = Math.max(0, Math.min(100, pct));

  const circumference = 301.6;
  const dashOffset = circumference - (circumference * clamped) / 100;

  return (
    <div className="flex w-full flex-col items-center">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">
        ACCREDITATION READINESS
      </p>
      <div className="relative mt-3 h-[120px] w-[120px]">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r="48" stroke="#F1F5F9" strokeWidth="10" fill="none" />
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#2563EB"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-semibold leading-none text-[#0F172A]">{clamped}%</span>
          <span className="mt-1 text-[10px] text-[#94A3B8]">Readiness</span>
        </div>
      </div>
      <span className="mt-3 rounded-full bg-[#F0FDF4] px-3 py-1 text-[11px] font-medium text-[#16A34A]">
        {status}
      </span>
    </div>
  );
}
