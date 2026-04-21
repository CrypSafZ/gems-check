import { SearchBar } from "@/components/SearchBar";
import { GemLogo } from "@/components/GemLogo";
import { allMembers, getMeta } from "@/lib/lookup";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";

const PREVIEW_QUERIES = allMembers()
  .slice(0, 6)
  .map((m) => m.username);
const META = getMeta();

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <GemLogo size={72} />
          <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight text-gem-white leading-none">
            gems-check
          </h1>
          <p className="text-base sm:text-lg text-lavender/80 max-w-md">
            Check your{" "}
            <span className="text-gem-white font-semibold">AlphaGEMs</span>{" "}
            Discord stats. Are you a gem, or just a cave dweller?
          </p>
        </div>

        <SearchBar />

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

      <footer className="mt-auto pt-16 text-[10px] font-mono uppercase tracking-[0.2em] text-lavender/40 text-center">
        <div>0xAlphaGEMs · {formatNumber(META.totalMembers)} gems tracked</div>
        <div className="mt-1">snapshot {formatDate(META.exportedAt)}</div>
      </footer>
    </main>
  );
}
