import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
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

const ACCOUNT = requiredEnv("GWS_ACCOUNT");
const MASTER_SHEET_ID = requiredEnv("GEMS_CHECK_SHEET_ID");
const MASTER_TAB = process.env.GEMS_CHECK_MASTER_TAB ?? "Gems";

type SourceConfig = {
  id: string;
  name: string;
  tab: string;
  range: string;
  parser: "usernameDiscordX" | "goblynzWallets" | "stormRae";
};

const SOURCE_CONFIGS: SourceConfig[] = process.env.GEMS_CHECK_X_HANDLE_SOURCES
  ? JSON.parse(process.env.GEMS_CHECK_X_HANDLE_SOURCES)
  : [];

const SOURCES: Array<{
  id: string;
  name: string;
  tab: string;
  range: string;
  parse: (rows: string[][]) => Array<{
    username?: string;
    discordId?: string;
    xHandle: string;
  }>;
}> = SOURCE_CONFIGS.map((source) => ({
  ...source,
  parse: parserFor(source.parser),
}));

function parserFor(parser: SourceConfig["parser"]): (
  rows: string[][],
) => Array<{
  username?: string;
  discordId?: string;
  xHandle: string;
}> {
  switch (parser) {
    case "usernameDiscordX":
      return (rows) =>
        rows
          .map((r) => ({
            username: (r[0] ?? "").trim(),
            discordId: (r[1] ?? "").trim(),
            xHandle: normalizeHandle(r[2] ?? ""),
          }))
          .filter((r) => r.xHandle);
    case "goblynzWallets":
      return (rows) => {
        const out: Array<{ username: string; xHandle: string }> = [];
        for (const r of rows) {
          const username = (r[0] ?? "").trim();
          const xAuthor = (r[1] ?? "").trim();
          if (!username || !xAuthor) continue;
          if (username.toLowerCase() === "discord") continue;
          const xHandle = normalizeHandle(xAuthor);
          if (xHandle) out.push({ username, xHandle });
        }
        return out;
      };
    case "stormRae":
      return (rows) =>
        rows
          .map((r) => ({
            username: (r[1] ?? "").trim(),
            xHandle: normalizeHandle(r[2] ?? ""),
          }))
          .filter((r) => r.xHandle && r.username);
  }
}

function normalizeHandle(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  // "Name (@handle)" pattern
  const paren = trimmed.match(/@([A-Za-z0-9_]{1,15})\s*\)?\s*$/);
  if (paren) return paren[1];
  // URL pattern
  const url = trimmed.match(/(?:twitter\.com|x\.com)\/@?([A-Za-z0-9_]{1,15})/i);
  if (url) return url[1];
  // "@handle" or bare handle
  const bare = trimmed.replace(/^@/, "");
  if (/^[A-Za-z0-9_]{1,15}$/.test(bare)) return bare;
  // Try first @handle substring inside noise
  const inner = trimmed.match(/@([A-Za-z0-9_]{1,15})/);
  if (inner) return inner[1];
  return "";
}

function fetchRows(sheetId: string, range: string): string[][] {
  const out = execFileSync(
    "gog",
    ["sheets", "get", sheetId, range, `--account=${ACCOUNT}`, "--json"],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out);
  return (parsed.values ?? []) as string[][];
}

interface SnapshotMember {
  id: string;
  username: string;
  rank: number;
}

interface Snapshot {
  members: SnapshotMember[];
}

function main() {
  const apply = process.argv.includes("--apply");
  console.log(`💎 enrich-x-handles (${apply ? "APPLY" : "dry-run"})\n`);

  const snapshot = JSON.parse(
    readFileSync(join(__dirname, "..", "data", "snapshot.json"), "utf-8"),
  ) as Snapshot;

  const ourMembers = snapshot.members;
  const ourById = new Map(ourMembers.map((m) => [m.id, m]));
  const ourByUsername = new Map(
    ourMembers.map((m) => [m.username.toLowerCase(), m]),
  );
  console.log(`  snapshot: ${ourMembers.length} members\n`);

  // Pull current Gems sheet x_handle column
  const gemsRows = fetchRows(MASTER_SHEET_ID, `${MASTER_TAB}!A2:H10000`);
  const gemsByUsername = new Map<string, { rowIdx: number; xHandle: string }>();
  gemsRows.forEach((row, i) => {
    const u = (row[0] ?? "").trim().toLowerCase();
    const x = (row[7] ?? "").trim();
    if (u) gemsByUsername.set(u, { rowIdx: i + 2, xHandle: x });
  });
  const existingFilled = [...gemsByUsername.values()].filter((v) =>
    v.xHandle.trim(),
  ).length;
  console.log(
    `  gems sheet: ${gemsByUsername.size} members, ${existingFilled} with x_handle already set\n`,
  );

  // Build merged source map — id preferred, username fallback
  const byId = new Map<string, { handle: string; source: string }>();
  const byUsername = new Map<string, { handle: string; source: string }>();
  const sourceCounts: Record<string, number> = {};

  for (const src of SOURCES) {
    console.log(`  pulling ${src.name}...`);
    const rows = fetchRows(src.id, `${src.tab}!${src.range}`);
    const parsed = src.parse(rows);
    sourceCounts[src.name] = parsed.length;
    for (const p of parsed) {
      if (
        p.discordId &&
        /^\d{10,}$/.test(p.discordId) &&
        !byId.has(p.discordId)
      ) {
        byId.set(p.discordId, { handle: p.xHandle, source: src.name });
      }
      if (p.username) {
        const u = p.username.toLowerCase();
        if (!byUsername.has(u)) {
          byUsername.set(u, { handle: p.xHandle, source: src.name });
        }
      }
    }
  }
  console.log(
    `\n  source rows: ${Object.entries(sourceCounts)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")}`,
  );
  console.log(`  merged: ${byId.size} by-id, ${byUsername.size} by-username\n`);

  // Resolve for each of our 608 members
  const toFill: Array<{
    username: string;
    rank: number;
    rowIdx: number;
    handle: string;
    source: string;
    matchedVia: "id" | "username";
  }> = [];
  const alreadyHas: string[] = [];
  const notInGemsSheet: string[] = [];
  const missing: Array<{ username: string; rank: number }> = [];

  for (const m of ourMembers) {
    const row = gemsByUsername.get(m.username.toLowerCase());
    if (!row) {
      notInGemsSheet.push(m.username);
      continue;
    }
    if (row.xHandle.trim()) {
      alreadyHas.push(m.username);
      continue;
    }
    // Try id, then username
    const byIdHit = byId.get(m.id);
    const byUsernameHit = byUsername.get(m.username.toLowerCase());
    const hit = byIdHit ?? byUsernameHit;
    if (hit) {
      toFill.push({
        username: m.username,
        rank: m.rank,
        rowIdx: row.rowIdx,
        handle: hit.handle,
        source: hit.source,
        matchedVia: byIdHit ? "id" : "username",
      });
    } else {
      missing.push({ username: m.username, rank: m.rank });
    }
  }

  console.log(`📊 Results\n`);
  console.log(`  ${alreadyHas.length} already have x_handle in Gems sheet`);
  console.log(`  ${toFill.length} can be filled from external sources`);
  console.log(
    `    — by discord id: ${toFill.filter((t) => t.matchedVia === "id").length}`,
  );
  console.log(
    `    — by username:  ${toFill.filter((t) => t.matchedVia === "username").length}`,
  );
  console.log(`  ${missing.length} still missing (no handle found anywhere)`);
  console.log(
    `  ${notInGemsSheet.length} snapshot members not in Gems sheet (skipped)\n`,
  );

  const reportPath = join(__dirname, "..", "data", "x-handles-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totals: {
          snapshot: ourMembers.length,
          gemsSheet: gemsByUsername.size,
          alreadyFilled: alreadyHas.length,
          toFill: toFill.length,
          missing: missing.length,
          notInGemsSheet: notInGemsSheet.length,
        },
        sourceCounts,
        toFill,
        missing,
        notInGemsSheet,
      },
      null,
      2,
    ),
  );
  console.log(`  report → ${reportPath}`);

  if (!apply) {
    console.log(`\n  (dry-run) re-run with --apply to write to the sheet.`);
    return;
  }

  if (toFill.length === 0) {
    console.log(`\n  nothing to apply.`);
    return;
  }

  console.log(`\n✍️  writing ${toFill.length} x_handle cells to Gems sheet...`);
  // Use gog sheets update per cell. For efficiency, batch via individual updates.
  let written = 0;
  for (const t of toFill) {
    try {
      execFileSync(
        "gog",
        [
          "sheets",
          "update",
          MASTER_SHEET_ID,
          `${MASTER_TAB}!H${t.rowIdx}`,
          t.handle,
          `--account=${ACCOUNT}`,
        ],
        { encoding: "utf8" },
      );
      written++;
      if (written % 25 === 0) console.log(`    ${written}/${toFill.length}`);
    } catch (err) {
      console.warn(
        `    ⚠ ${t.username} (row ${t.rowIdx}):`,
        (err as Error).message,
      );
    }
  }
  console.log(`✅ wrote ${written} cells`);
}

main();
