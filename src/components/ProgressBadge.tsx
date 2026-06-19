"use client";

interface ProgressBadgeProps {
  discovered: number;
  total: number;
}

export function ProgressBadge({ discovered, total }: ProgressBadgeProps) {
  return (
    <div className="fixed top-4 left-4 z-30 rounded-full border border-white/40 bg-[#faf7f2]/90 px-4 py-2 shadow-lg shadow-[#5c4a3a]/10 backdrop-blur-sm">
      <p className="text-xs tracking-wide text-[#a89584]">已发现</p>
      <p className="font-serif text-lg text-[#5c4a3a]">
        {discovered}
        <span className="text-sm text-[#a89584]"> / {total}</span>
      </p>
    </div>
  );
}
