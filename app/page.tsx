import { SearchBar } from "@/components/SearchBar";
import { GemLogo } from "@/components/GemLogo";
import { getMeta } from "@/lib/lookup";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";
import { Trophy } from "lucide-react";

const PREVIEW_QUERIES = [
  "safz",
  "tulipxbt",
  "shaq2wade",
  "zerachielo",
  "0xkeet",
  "vespucci",
];
const META = getMeta();

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <GemLogo size={144} />
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gem-white leading-[1.05] uppercase">
            GEM Unemployment
            <span className="block text-violet-300/95 normal-case font-display font-medium italic tracking-normal">
              checker
            </span>
          </h1>
          <div className="flex flex-col items-center gap-2 max-w-lg">
            <p className="text-lg sm:text-xl font-semibold text-gem-white/95 leading-snug">
              Check your{" "}
              <a
                href="https://x.com/0xAlphaGEMs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-200 font-bold underline decoration-violet-400/70 underline-offset-4 hover:decoration-violet-300 hover:text-gem-white transition-colors"
              >
                0xAlphaGEMs
              </a>{" "}
              Discord stats
            </p>
            <p className="text-sm sm:text-base text-lavender/80 leading-snug">
              Are you a{" "}
              <span className="text-violet-200 font-bold">GEM</span>? or just a{" "}
              <span className="italic text-rose-300">lurker</span>?
            </p>
          </div>
        </div>

        <SearchBar />

        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-violet-500/40 to-fuchsia-600/40 ring-1 ring-violet-300/40 text-gem-white text-sm font-semibold hover:from-violet-500/60 hover:to-fuchsia-600/60 transition-all duration-200"
        >
          <Trophy className="w-4 h-4" aria-hidden="true" />
          View GEMs Leaderboard
        </Link>

        <div className="flex flex-col items-center gap-3 mt-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-lavender/50 font-mono">
            Try a preview
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {PREVIEW_QUERIES.map((u) => (
              <Link
                key={u}
                href={`/${u}`}
                className="text-xs font-mono px-3 py-1.5 rounded-full glass text-lavender hover:text-gem-white hover:bg-violet-500/20 transition-all duration-200"
              >
                @{u}
              </Link>
            ))}
            <Link
              href="/notagem"
              className="text-xs font-mono px-3 py-1.5 rounded-full glass text-rose-300 hover:text-gem-white hover:bg-rose-500/20 transition-all duration-200"
            >
              @notagem
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-auto pt-16 flex flex-col items-center gap-2 text-center">
        <a
          href="https://x.com/0xAlphaGEMs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold text-gem-white hover:bg-violet-500/20 hover:text-violet-100 transition-all duration-200"
        >
          <span className="text-violet-300">𝕏</span>
          <span>@0xAlphaGEMs</span>
        </a>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-lavender/50">
          {formatNumber(META.totalMembers)} gems tracked · snapshot {formatDate(META.exportedAt)}
        </div>
      </footer>
    </main>
  );
}
