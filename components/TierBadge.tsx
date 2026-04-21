import type { Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-gem-white shadow-lg",
        tier.badge,
      )}
    >
      <span>{tier.label}</span>
    </div>
  );
}
