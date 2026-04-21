import Image from "next/image";
import type { MemberSnapshot, SnapshotMeta } from "@/lib/types";
import { tierForRank } from "@/lib/tiers";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { StatTile } from "./StatTile";
import { TierBadge } from "./TierBadge";

interface StatCardProps {
  member: MemberSnapshot | null;
  query: string;
  meta: SnapshotMeta;
}

export function StatCard({ member, query, meta }: StatCardProps) {
  const tier = tierForRank(member?.rank ?? null);
  const isNotAGem = !member;

  return (
    <article
      className={cn(
        "relative w-full max-w-2xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden glass-strong shadow-2xl",
        "ring-2",
        tier.ring,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
          tier.glow,
        )}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full w-full p-6 sm:p-8 flex flex-col justify-between">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={cn(
                "relative shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-cosmos",
                tier.ring,
              )}
            >
              <Image
                src={member?.pfpUrl ?? "/brand/gem.jpg"}
                alt=""
                width={72}
                height={72}
                className="rounded-full gem-glow"
                priority
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-gem-white leading-tight truncate">
                {isNotAGem ? `@${query}` : `@${member.username}`}
              </h2>
              <p className="text-sm text-lavender/80 font-mono truncate">
                {isNotAGem
                  ? "Not found in the cave"
                  : `Rank #${member.rank} of ${formatNumber(meta.totalMembers)}`}
              </p>
            </div>
          </div>
          <TierBadge tier={tier} />
        </header>

        <div className="my-4">
          <p className="text-base sm:text-lg font-display italic text-gem-white/90 leading-snug">
            &ldquo;{tier.roast}&rdquo;
          </p>
        </div>

        {!isNotAGem && (
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            <StatTile label="3d" value={member.msg3d} />
            <StatTile label="7d" value={member.msg7d} />
            <StatTile label="14d" value={member.msg14d} />
            <StatTile label="30d" value={member.msg30d} />
            <StatTile label="all" value={member.msgAll} />
          </div>
        )}

        <footer className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-lavender/60 mt-3">
          <span>0xAlphaGEMs</span>
          <span>{formatDate(meta.exportedAt)}</span>
        </footer>
      </div>
    </article>
  );
}
