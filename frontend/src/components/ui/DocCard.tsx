import type { ReactNode } from "react";

interface DocCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
}

export function DocCard({ icon, title, description, buttonLabel, onButtonClick }: DocCardProps) {
  return (
    <article className="flex h-full flex-col gap-2.5 rounded-card border border-[#E2E8F0] bg-white p-4 transition-all duration-150 hover:border-[#93C5FD]">
      <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-[#EFF6FF] text-[#2563EB]">
        {icon}
      </div>
      <h3 className="text-[13px] font-semibold text-[#0F172A]">{title}</h3>
      <p className="flex-1 text-[12px] leading-[1.55] text-[#64748B]">{description}</p>
      <button
        type="button"
        onClick={onButtonClick}
        className="mt-auto w-full rounded-[7px] border border-[#E2E8F0]/80 bg-[#F8FAFC] px-3 py-[7px] text-[12px] font-medium text-[#334155] shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-150 hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
      >
        {buttonLabel}
      </button>
    </article>
  );
}
