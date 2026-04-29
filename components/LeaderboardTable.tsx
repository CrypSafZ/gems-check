"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { MemberSnapshot, MemberOverride, RoleInfo } from "@/lib/types";
import { formatNumber, formatVoiceHours, roleColorHex } from "@/lib/utils";

export interface LeaderboardRow {
  member: MemberSnapshot;
  override: MemberOverride | null;
  roles: RoleInfo[];
}

interface Props {
  rows: LeaderboardRow[];
}

const PAGE_SIZE = 100;

function formatJoined(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LeaderboardTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ member, override }) => {
      const handle =
        override?.xHandle && !override.xHandleAuto
          ? override.xHandle.toLowerCase()
          : "";
      return (
        member.username.toLowerCase().includes(q) ||
        member.displayName.toLowerCase().includes(q) ||
        handle.includes(q)
      );
    });
  }, [rows, deferred]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="glass-strong rounded-2xl flex items-center gap-3 px-4 py-3">
        <Search className="w-4 h-4 text-lavender" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Filter by username, display name, or X handle"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none text-gem-white placeholder:text-lavender/50 font-mono text-sm"
        />
        <span className="text-[11px] font-mono text-lavender/60 tabular-nums">
          {formatNumber(filtered.length)} / {formatNumber(rows.length)}
        </span>
      </div>

      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_minmax(180px,1.2fr)_minmax(140px,0.9fr)_90px_110px_90px_minmax(160px,1.5fr)] gap-3 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-lavender/70 border-b border-violet-300/10">
          <span>Rank</span>
          <span>Member</span>
          <span>X Handle</span>
          <span className="text-right">Msgs</span>
          <span>Joined</span>
          <span className="text-right">VC Hours</span>
          <span>Roles</span>
        </div>

        <ul className="divide-y divide-violet-300/10">
          {visible.map(({ member, override, roles }) => {
            const xHandle =
              override?.xHandle && !override.xHandleAuto
                ? override.xHandle
                : null;
            const topRoles = roles.slice(0, 3);
            const moreRoles = roles.length - topRoles.length;
            return (
              <li
                key={member.id}
                className="grid grid-cols-[48px_1fr] md:grid-cols-[60px_minmax(180px,1.2fr)_minmax(140px,0.9fr)_90px_110px_90px_minmax(160px,1.5fr)] gap-3 px-4 py-3 hover:bg-violet-500/8 transition-colors items-center"
              >
                <span className="text-sm font-mono font-bold text-violet-200 tabular-nums">
                  #{member.rank}
                </span>

                <Link
                  href={`/${encodeURIComponent(member.username)}`}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <Image
                    src={member.pfpUrl || "/brand/gem.jpg"}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full ring-1 ring-violet-300/40 shrink-0"
                    unoptimized
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gem-white truncate group-hover:text-violet-200 transition-colors">
                      @{member.username}
                    </div>
                    {member.displayName &&
                      member.displayName !== member.username && (
                        <div className="text-[11px] font-mono text-lavender/60 truncate">
                          {member.displayName}
                        </div>
                      )}
                  </div>
                </Link>

                <div className="hidden md:block min-w-0">
                  {xHandle ? (
                    <a
                      href={`https://x.com/${xHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-violet-100 hover:text-violet-300 transition-colors truncate"
                    >
                      <span className="text-violet-200">𝕏</span>
                      <span className="truncate">@{xHandle}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-lavender/40">
                      —
                    </span>
                  )}
                </div>

                <div className="hidden md:block text-right text-sm font-mono font-bold text-gem-white tabular-nums">
                  {formatNumber(member.msgAll)}
                </div>

                <div className="hidden md:block text-[11px] font-mono text-lavender/70">
                  {formatJoined(member.joinedAt)}
                </div>

                <div className="hidden md:block text-right text-sm font-mono font-semibold text-violet-200 tabular-nums">
                  {formatVoiceHours(member.voiceMinutes)}
                </div>

                <div className="hidden md:flex flex-wrap gap-1 min-w-0">
                  {topRoles.map((r) => {
                    const color = roleColorHex(r.color) ?? "#a78bfa";
                    return (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 ring-1"
                        style={{
                          color,
                          borderColor: `${color}66`,
                        }}
                      >
                        {r.emoji ? (
                          <span className="text-[10px] leading-none">
                            {r.emoji}
                          </span>
                        ) : (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        )}
                        <span className="truncate max-w-[100px]">{r.name}</span>
                      </span>
                    );
                  })}
                  {moreRoles > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 ring-1 ring-violet-300/25 text-lavender/70">
                      +{moreRoles}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="px-4 py-12 text-center text-sm font-mono text-lavender/60">
              No gems match &ldquo;{deferred}&rdquo;
            </li>
          )}
        </ul>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-2 rounded-lg glass text-xs font-mono font-semibold text-lavender hover:text-gem-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Prev
          </button>
          <span className="text-xs font-mono text-lavender/70 px-3 tabular-nums">
            Page {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="px-3 py-2 rounded-lg glass text-xs font-mono font-semibold text-lavender hover:text-gem-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
