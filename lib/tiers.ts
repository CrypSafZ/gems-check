import type { Tier, TierId } from "./types";

export const TIERS: Record<TierId, Tier> = {
  emperor: {
    id: "emperor",
    label: "💎 THE GEM EMPEROR",
    title: "#1 of the cave",
    roast:
      "The cave kneels. You probably haven't touched grass in 2026. We thank you.",
    glow: "from-fuchsia-400/60 via-violet-500/40 to-indigo-500/30",
    ring: "ring-fuchsia-300/70",
    badge: "bg-gradient-to-br from-fuchsia-400 to-violet-600",
  },
  podium: {
    id: "podium",
    label: "🔱 PODIUM GEM",
    title: "Top 3",
    roast:
      "Three of you hold this server up. The other two should sleep sometimes.",
    glow: "from-violet-400/50 via-purple-500/40 to-indigo-500/30",
    ring: "ring-violet-300/70",
    badge: "bg-gradient-to-br from-violet-400 to-purple-600",
  },
  hall: {
    id: "hall",
    label: "⚔️ HALL OF GEMS",
    title: "Top 5",
    roast: "Certified menace. Top 5 out of thousands. Hydrate.",
    glow: "from-purple-400/50 via-violet-500/40 to-indigo-500/30",
    ring: "ring-purple-300/70",
    badge: "bg-gradient-to-br from-purple-400 to-violet-600",
  },
  elite: {
    id: "elite",
    label: "🛡️ ELITE GUARD",
    title: "Top 10",
    roast: "Deca-gem status. Mods fear you, lurkers envy you.",
    glow: "from-indigo-400/50 via-violet-500/40 to-purple-500/30",
    ring: "ring-indigo-300/70",
    badge: "bg-gradient-to-br from-indigo-400 to-violet-600",
  },
  inner: {
    id: "inner",
    label: "🪩 INNER CIRCLE",
    title: "Top 30",
    roast: "You type like rent is due tomorrow. Respect.",
    glow: "from-violet-400/40 via-indigo-500/30 to-blue-500/20",
    ring: "ring-violet-300/60",
    badge: "bg-gradient-to-br from-violet-400 to-indigo-600",
  },
  shiny: {
    id: "shiny",
    label: "🔮 SHINY GEM",
    title: "Top 50",
    roast: "Solid. Your keyboard has opinions and we like them.",
    glow: "from-indigo-400/40 via-blue-500/30 to-violet-500/20",
    ring: "ring-indigo-300/60",
    badge: "bg-gradient-to-br from-indigo-400 to-blue-600",
  },
  regular: {
    id: "regular",
    label: "🧿 CAVE REGULAR",
    title: "Top 100",
    roast: "Mid-tier royalty. You show up, you shine, you carry.",
    glow: "from-blue-400/40 via-indigo-500/30 to-violet-500/20",
    ring: "ring-blue-300/60",
    badge: "bg-gradient-to-br from-blue-400 to-indigo-600",
  },
  dweller: {
    id: "dweller",
    label: "🦇 CAVE DWELLER",
    title: "Top 300",
    roast: "You exist. The gems see you. Barely.",
    glow: "from-violet-500/30 via-purple-600/20 to-indigo-700/20",
    ring: "ring-violet-400/50",
    badge: "bg-gradient-to-br from-violet-500 to-purple-700",
  },
  ghost: {
    id: "ghost",
    label: "🫥 GHOST GEM",
    title: "300+ (certified lurker)",
    roast: "Lurker energy confirmed. Say something, coward.",
    glow: "from-slate-500/30 via-violet-700/20 to-indigo-800/20",
    ring: "ring-slate-400/40",
    badge: "bg-gradient-to-br from-slate-500 to-violet-700",
  },
  notagem: {
    id: "notagem",
    label: "☠️ NOT A GEM",
    title: "Stranger to the cave",
    roast:
      "Who is this. The cave doesn't know you. Fix that → discord.gg/alphagems",
    glow: "from-rose-500/30 via-red-500/20 to-zinc-800/20",
    ring: "ring-rose-400/50",
    badge: "bg-gradient-to-br from-rose-500 to-zinc-800",
  },
};

export function tierForRank(rank: number | null): Tier {
  if (rank === null || rank <= 0) return TIERS.notagem;
  if (rank === 1) return TIERS.emperor;
  if (rank <= 3) return TIERS.podium;
  if (rank <= 5) return TIERS.hall;
  if (rank <= 10) return TIERS.elite;
  if (rank <= 30) return TIERS.inner;
  if (rank <= 50) return TIERS.shiny;
  if (rank <= 100) return TIERS.regular;
  if (rank <= 300) return TIERS.dweller;
  return TIERS.ghost;
}
