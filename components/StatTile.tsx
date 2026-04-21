import { formatNumber } from "@/lib/utils";

export function StatTile({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="glass rounded-xl px-3 py-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.15em] text-lavender/70 font-mono">
        {label}
      </span>
      <span className="text-2xl font-semibold text-gem-white font-mono tabular-nums">
        {formatNumber(value)}
      </span>
    </div>
  );
}
