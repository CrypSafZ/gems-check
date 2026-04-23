import { formatNumber } from "@/lib/utils";

export function StatTile({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const formatted = formatNumber(value);

  return (
    <div className="glass rounded-xl px-2 sm:px-3 py-3 flex flex-col gap-1 min-w-0 overflow-hidden">
      <span className="text-[10px] uppercase tracking-[0.15em] text-lavender/70 font-mono">
        {label}
      </span>
      <span
        className="text-sm sm:text-base font-bold text-gem-white font-mono tabular-nums leading-none truncate"
        title={formatted}
      >
        {formatted}
      </span>
    </div>
  );
}
