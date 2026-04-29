"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, RotateCcw, Trophy } from "lucide-react";
import { toPng } from "html-to-image";
import type { MemberSnapshot } from "@/lib/types";
import { tierForRank } from "@/lib/tiers";
import { formatNumber } from "@/lib/utils";

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareActionsProps {
  member: MemberSnapshot | null;
  query: string;
}

export function ShareActions({ member, query }: ShareActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const tier = tierForRank(member?.rank ?? null);
  const label = tier.label.replace(/^[^A-Za-z]+/, "").trim();

  const tweetText = member
    ? `The gem cave ranked me ${label} 💎 #${member.rank} / ${formatNumber(member.msgAll)} msgs all-time. Are you a gem?`
    : `The gem cave doesn't know me yet. Are you a gem?`;

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${encodeURIComponent(query)}`
      : "";

  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText,
  )}&url=${encodeURIComponent(url)}`;

  const downloadName = `gems-check-${query.toLowerCase().replace(/[^a-z0-9]/g, "-") || "card"}.png`;

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      // Direct download from the API route for high quality PNG
      const link = document.createElement("a");
      link.href = `/api/card/${encodeURIComponent(query)}`;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("[gems-check] download failed", err);
      window.open(`/api/card/${encodeURIComponent(query)}`, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      <a
        href={tweetHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass-strong text-gem-white text-sm font-semibold hover:brightness-125 transition-all duration-200 cursor-pointer"
      >
        <XLogo className="w-4 h-4" />
        Post it
      </a>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass-strong text-gem-white text-sm font-semibold hover:brightness-125 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-progress"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        {downloading ? "Rendering…" : "Download PNG"}
      </button>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass text-lavender text-sm font-semibold hover:bg-violet-500/20 transition-all duration-200 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        Check again
      </Link>
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-violet-500/40 to-fuchsia-600/40 ring-1 ring-violet-300/40 text-gem-white text-sm font-semibold hover:from-violet-500/60 hover:to-fuchsia-600/60 transition-all duration-200 cursor-pointer"
      >
        <Trophy className="w-4 h-4" aria-hidden="true" />
        GEMs Leaderboard
      </Link>
    </div>
  );
}
