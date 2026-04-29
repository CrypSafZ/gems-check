import type { Metadata } from "next";
import Link from "next/link";
import { GemLogo } from "@/components/GemLogo";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/LeaderboardTable";
import { allMembers, getMeta, getRoles, lookupOverride } from "@/lib/lookup";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "GEMs Leaderboard — gems-check",
  description:
    "Full ranking of every gem in the cave. Messages, roles, voice hours, X handles.",
};

export default function LeaderboardPage() {
  const meta = getMeta();
  const members = allMembers();
  const rows: LeaderboardRow[] = members.map((member) => ({
    member,
    override: lookupOverride(member.username),
    roles: getRoles(member.roleIds),
  }));

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 w-full">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Back to home"
          >
            <GemLogo size={40} />
            <span className="font-heading text-base sm:text-lg font-black uppercase tracking-tight text-gem-white group-hover:text-violet-300 transition-colors">
              GEM Unemployment{" "}
              <span className="italic font-display font-bold normal-case text-violet-300/95">
                checker
              </span>
            </span>
          </Link>

          <h1 className="font-display text-3xl sm:text-5xl font-bold text-gem-white leading-tight">
            GEMs <span className="text-violet-300/95 italic">Leaderboard</span>
          </h1>
          <p className="text-sm sm:text-base text-lavender/80 max-w-xl">
            Every gem in the cave, ranked by all-time messages. Click any row
            to see their card.
          </p>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-lavender/50">
            {formatNumber(meta.totalMembers)} gems · snapshot{" "}
            {formatDate(meta.exportedAt)}
          </div>
        </header>

        <LeaderboardTable rows={rows} />

        <footer className="flex flex-col items-center gap-3 pt-4 pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass text-lavender text-sm font-semibold hover:text-gem-white hover:bg-violet-500/20 transition-all duration-200"
          >
            ← Back to checker
          </Link>
          <a
            href="https://x.com/0xAlphaGEMs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white hover:text-violet-200 transition-colors"
          >
            Made by @0xAlphaGEMs
          </a>
        </footer>
      </div>
    </main>
  );
}
