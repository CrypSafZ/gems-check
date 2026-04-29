import Image from "next/image";
import type {
  MemberOverride,
  MemberSnapshot,
  RoleInfo,
  SnapshotMeta,
  Tier,
} from "@/lib/types";
import { tierForRank } from "@/lib/tiers";
import { cn, formatDate, formatNumber, formatVoiceHours } from "@/lib/utils";
import { RolePills } from "./RolePills";
import { StatTile } from "./StatTile";
import { TierBadge } from "./TierBadge";

interface StatCardProps {
  member: MemberSnapshot | null;
  query: string;
  meta: SnapshotMeta;
  override?: MemberOverride | null;
  roles?: RoleInfo[];
}

function applyOverride(tier: Tier, override: MemberOverride | null | undefined): Tier {
  if (!override) return tier;
  return {
    ...tier,
    label: override.customLabel?.trim() || tier.label,
    title: override.customTitle?.trim() || tier.title,
    roast: override.customRoast?.trim() || tier.roast,
  };
}

export function StatCard({
  member,
  query,
  meta,
  override,
  roles = [],
}: StatCardProps) {
  const baseTier = tierForRank(member?.rank ?? null);
  const tier = applyOverride(baseTier, override);
  const isNotAGem = !member;
  const xHandle =
    override?.xHandle && !override.xHandleAuto ? override.xHandle : undefined;

  if (isNotAGem) {
    return (
      <article
        id="gem-card"
        data-gem-card
        className={cn(
          "relative w-full max-w-2xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden glass-strong shadow-2xl ring-2",
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
        <div className="relative z-10 h-full w-full p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
          <div className="shrink-0 w-[38%] sm:w-[40%] aspect-square rounded-2xl overflow-hidden ring-2 ring-rose-400/60 shadow-xl">
            <Image
              src="/brand/exit-guy.jpg"
              alt="Exit sign — get out"
              width={440}
              height={440}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-mono text-lavender/70 truncate">
              @{query}
            </span>
            <h2 className="font-display font-black text-gem-white leading-[0.95] text-[clamp(1.75rem,7vw,3.75rem)]">
              Who tf
              <br />
              are you?
              <br />
              <span className="text-rose-300">Get out.</span>
            </h2>
          </div>
        </div>
        <footer className="absolute bottom-3 inset-x-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Made by @0xAlphaGEMs
            <Image
              src="/brand/gem.jpg"
              alt=""
              width={18}
              height={18}
              className="rounded-full ring-1 ring-violet-300/70"
            />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-lavender/60">
            {formatDate(meta.exportedAt)}
          </span>
        </footer>
      </article>
    );
  }

  return (
    <article
      id="gem-card"
      data-gem-card
      className={cn(
        "relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden glass-strong shadow-2xl ring-2",
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

      <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={cn(
                "relative shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-cosmos",
                tier.ring,
              )}
            >
              <Image
                src={member.pfpUrl ?? "/brand/gem.jpg"}
                alt=""
                width={88}
                height={88}
                className="rounded-full"
                priority
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gem-white leading-tight truncate">
                @{member.username}
              </h2>
              {xHandle && (
                <a
                  href={`https://x.com/${xHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/15 px-2.5 py-1 text-sm font-mono font-semibold text-violet-100 hover:bg-violet-500/25 hover:border-violet-300/60 transition-colors"
                  title={`@${xHandle} on X`}
                >
                  <span className="text-violet-200 text-base leading-none">𝕏</span>
                  <span className="truncate">@{xHandle}</span>
                </a>
              )}
              <p className="text-sm text-lavender/80 font-mono font-semibold truncate mt-1">
                {`Rank #${member.rank} of ${formatNumber(meta.totalMembers)}`}
              </p>
              <p className="text-[11px] text-lavender/60 font-mono mt-0.5">
                Member since {formatDate(member.joinedAt)}
              </p>
            </div>
          </div>
          <TierBadge tier={tier} />
        </header>

        <div>
          <p className="text-lg sm:text-xl font-display italic font-bold text-gem-white leading-snug drop-shadow-lg">
            &ldquo;{tier.roast}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          <StatTile label="3d" value={member.msg3d} />
          <StatTile label="7d" value={member.msg7d} />
          <StatTile label="14d" value={member.msg14d} />
          <StatTile label="30d" value={member.msg30d} />
          <StatTile label="all" value={member.msgAll} />
        </div>

        {member.voiceMinutes !== undefined && member.voiceMinutes > 0 && (
          <div className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0" aria-hidden="true">🎙️</span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.15em] text-lavender/70 font-mono">
                  Time in the Caves
                </div>
                <div className="text-lg sm:text-xl font-bold text-gem-white font-mono tabular-nums leading-tight">
                  {formatVoiceHours(member.voiceMinutes)}
                </div>
              </div>
            </div>
            {member.voiceRank !== undefined && (
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase tracking-[0.15em] text-lavender/70 font-mono">
                  VC Rank
                </div>
                <div className="text-lg sm:text-xl font-bold text-violet-200 font-mono tabular-nums leading-tight">
                  #{member.voiceRank}
                </div>
              </div>
            )}
          </div>
        )}

        {roles.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-lavender/50">
              Roles
            </span>
            <RolePills roles={roles} />
          </div>
        )}

        <footer className="flex items-center justify-between gap-3 pt-1">
          <a
            href="https://x.com/0xAlphaGEMs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:text-violet-200 transition-colors"
          >
            <span>Made by @0xAlphaGEMs</span>
            <Image
              src="/brand/gem.jpg"
              alt=""
              width={20}
              height={20}
              className="rounded-full ring-1 ring-violet-300/70"
            />
          </a>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-lavender/60">
            {formatDate(meta.exportedAt)}
          </span>
        </footer>
      </div>
    </article>
  );
}
