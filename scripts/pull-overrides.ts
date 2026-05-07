import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required. Keep private Sheet IDs/accounts in env vars, not git.`,
    );
  }
  return value;
}

const SHEET_ID = requiredEnv("GEMS_CHECK_SHEET_ID");
const RANGE = process.env.GEMS_CHECK_SHEET_RANGE ?? "Gems!A2:H10000";
const ACCOUNT = requiredEnv("GWS_ACCOUNT");

interface Override {
  customLabel?: string;
  customTitle?: string;
  customRoast?: string;
  xHandle?: string;
  xHandleAuto?: boolean;
}

const RESERVED_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function normalizeHandle(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const m = trimmed.match(/(?:twitter\.com|x\.com)\/@?([A-Za-z0-9_]+)/i);
  if (m) return m[1];
  return trimmed.replace(/^@/, "");
}

// Old auto-backfilled tier defaults from the previous lib/tiers.ts.
// If a per-member cell exactly matches one of these, treat it as "no override"
// so the new Tiers 2 defaults from lib/tiers.ts can take over. Real per-member
// customs (anything else) are kept.
const STALE_TIER_LABELS = new Set([
  "💎 THE GEM EMPEROR",
  "🔱 PODIUM GEM",
  "⚔️ HALL OF GEMS",
  "🛡️ ELITE GUARD",
  "🪩 INNER CIRCLE",
  "🔮 SHINY GEM",
  "🧿 CAVE REGULAR",
  "🦇 CAVE DWELLER",
  "🫥 GHOST GEM",
  "☠️ NOT A GEM",
]);

const STALE_TIER_TITLES = new Set([
  "#1 of the cave",
  "Top 3",
  "Top 5",
  "Top 10",
  "Top 30",
  "Top 50",
  "Top 100",
  "Top 300",
  "300+ (certified lurker)",
  "Stranger to the cave",
]);

const STALE_TIER_ROASTS = new Set([
  "The cave kneels. You probably haven't touched grass in 2026. We thank you.",
  "Three of you hold this server up. The other two should sleep sometimes.",
  "Certified menace. Top 5 out of thousands. Hydrate.",
  "Deca-gem status. Mods fear you, lurkers envy you.",
  "You type like rent is due tomorrow. Respect.",
  "Solid. Your keyboard has opinions and we like them.",
  "Mid-tier royalty. You show up, you shine, you carry.",
  "You exist. The gems see you. Barely.",
  "Lurker energy confirmed. Say something, coward.",
  "Who tf are you? Get out.",
]);

function main() {
  const out = execFileSync(
    "gog",
    ["sheets", "get", SHEET_ID, RANGE, `--account=${ACCOUNT}`, "--json"],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );

  const parsed = JSON.parse(out);
  const rows: string[][] = parsed.values ?? parsed ?? [];

  const overrides: Record<string, Override> = Object.create(null);
  let filled = 0;
  let autoHandles = 0;

  for (const row of rows) {
    const username = (row[0] ?? "").trim().toLowerCase();
    if (!username) continue;
    if (RESERVED_KEYS.has(username)) continue;
    const customLabel = (row[4] ?? "").trim();
    const customTitle = (row[5] ?? "").trim();
    const customRoast = (row[6] ?? "").trim();
    const verifiedHandle = normalizeHandle(row[7] ?? "");
    const o: Override = verifiedHandle
      ? { xHandle: verifiedHandle }
      : { xHandle: username, xHandleAuto: true };
    if (!verifiedHandle) autoHandles++;
    if (customLabel && !STALE_TIER_LABELS.has(customLabel)) {
      o.customLabel = customLabel;
    }
    if (customTitle && !STALE_TIER_TITLES.has(customTitle)) {
      o.customTitle = customTitle;
    }
    if (customRoast && !STALE_TIER_ROASTS.has(customRoast)) {
      o.customRoast = customRoast;
    }
    overrides[username] = o;
    filled++;
  }

  const outPath = join(__dirname, "..", "data", "overrides.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        pulledAt: new Date().toISOString(),
        count: filled,
        byUsername: overrides,
      },
      null,
      2,
    ),
  );

  console.log(`✅ Wrote ${outPath}`);
  console.log(`   ${filled} members with overrides / x_handle`);
  console.log(
    `   ${autoHandles} fallback (xHandleAuto) — no link rendered until verified`,
  );
}

main();
