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

const ROLE_FILTERS: { label: string; roleId: string }[] = [
  { label: "GEM Council", roleId: "1002631773794074714" },
  { label: "Honorary GEM", roleId: "1047548927894884373" },
  { label: "GEM Dev", roleId: "1355147695622328389" },
  { label: "Waifu", roleId: "966049810509611099" },
  { label: "GEM", roleId: "904383136652222514" },
  { label: "GEMccess (Temp)", roleId: "1037810361363091486" },
  { label: "Rock", roleId: "1001618029114830929" },
  { label: "CummLab", roleId: "1120429080697901066" },
  { label: "GEM Guest", roleId: "1372527499866804295" },
  { label: "GEM Boss", roleId: "906043294314823680" },
  { label: "retard", roleId: "1449052260704194734" },
];

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
  const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set());
  const deferred = useDeferredValue(query);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of ROLE_FILTERS) counts[r.roleId] = 0;
    for (const { member } of rows) {
      for (const rid of member.roleIds) {
        if (rid in counts) counts[rid]++;
      }
    }
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    const hasRoleFilter = activeRoles.size > 0;
    if (!q && !hasRoleFilter) return rows;
    return rows.filter(({ member, override }) => {
      if (hasRoleFilter) {
        let match = false;
        for (const rid of member.roleIds) {
          if (activeRoles.has(rid)) {
            match = true;
            break;
          }
        }
        if (!match) return false;
      }
      if (!q) return true;
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
  }, [rows, deferred, activeRoles]);

  const toggleRole = (roleId: string) => {
    setActiveRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
    setPage(0);
  };

  const clearRoles = () => {
    setActiveRoles(new Set());
    setPage(0);
  };

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="rounded-2xl px-4 py-3 bg-[#15072b]/95 ring-1 ring-violet-300/25 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-lavender/80">
            Filter by role
          </span>
          {activeRoles.size > 0 && (
            <button
              type="button"
              onClick={clearRoles}
              className="text-[10px] font-mono uppercase tracking-[0.18em] text-rose-300 hover:text-rose-200 transition-colors"
            >
              Clear ({activeRoles.size})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_FILTERS.map((r) => {
            const active = activeRoles.has(r.roleId);
            const count = roleCounts[r.roleId] ?? 0;
            return (
              <button
                key={r.roleId}
                type="button"
                onClick={() => toggleRole(r.roleId)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all duration-150 ring-1 ${
                  active
                    ? "bg-violet-500/40 text-gem-white ring-violet-300/70 shadow-md"
                    : "bg-white/5 text-lavender/80 ring-violet-300/20 hover:bg-violet-500/15 hover:text-gem-white"
                }`}
              >
                <span>{r.label}</span>
                <span
                  className={`tabular-nums text-[10px] ${
                    active ? "text-violet-100" : "text-lavender/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="rounded-2xl flex items-center gap-3 px-4 py-3 bg-[#15072b]/95 ring-1 ring-violet-300/25 shadow-xl">
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

      <div className="rounded-2xl overflow-hidden bg-[#15072b]/95 ring-1 ring-violet-300/25 shadow-2xl">
        <div className="hidden md:grid grid-cols-[60px_minmax(180px,1.2fr)_minmax(140px,0.9fr)_90px_110px_90px_minmax(160px,1.5fr)] gap-3 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-lavender/80 bg-[#1f0b3c]/95 border-b border-violet-300/15">
          <span>Rank</span>
          <span>Member</span>
          <span>X Handle</span>
          <span className="text-right">Msgs</span>
          <span>Joined</span>
          <span className="text-right">VC Hours</span>
          <span>Roles</span>
        </div>

        <ul className="divide-y divide-violet-300/15">
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
                className="grid grid-cols-[44px_1fr_auto] md:grid-cols-[60px_minmax(180px,1.2fr)_minmax(140px,0.9fr)_90px_110px_90px_minmax(160px,1.5fr)] gap-3 px-4 py-3 hover:bg-violet-500/8 transition-colors items-center"
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
                    <div className="flex items-center gap-2 text-[11px] font-mono text-lavender/70 truncate">
                      {member.displayName &&
                        member.displayName !== member.username && (
                          <span className="truncate">{member.displayName}</span>
                        )}
                      <span className="md:hidden text-violet-200/80 tabular-nums">
                        · {formatNumber(member.msgAll)} msgs
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="md:hidden text-right text-[11px] font-mono text-lavender/70 tabular-nums">
                  {formatJoined(
                    override?.customJoinedAt?.trim() || member.joinedAt,
                  )}
                </div>

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
                  {formatJoined(
                    override?.customJoinedAt?.trim() || member.joinedAt,
                  )}
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
