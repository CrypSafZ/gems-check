import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SHEET_ID = "1-lA9O56XusqvPXt7zR39kh8OwI72s82NFlqlwPxGc-4";
const RANGE = "Gems!A2:H10000";
const ACCOUNT = "safzcryp@gmail.com";

interface Override {
  customLabel?: string;
  customTitle?: string;
  customRoast?: string;
  xHandle?: string;
}

function normalizeHandle(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const m = trimmed.match(/(?:twitter\.com|x\.com)\/@?([A-Za-z0-9_]+)/i);
  if (m) return m[1];
  return trimmed.replace(/^@/, "");
}

function main() {
  const out = execFileSync(
    "gog",
    [
      "sheets",
      "get",
      SHEET_ID,
      RANGE,
      `--account=${ACCOUNT}`,
      "--json",
    ],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );

  const parsed = JSON.parse(out);
  const rows: string[][] = parsed.values ?? parsed ?? [];

  const overrides: Record<string, Override> = {};
  let filled = 0;

  for (const row of rows) {
    const username = (row[0] ?? "").trim().toLowerCase();
    if (!username) continue;
    const customLabel = (row[4] ?? "").trim();
    const customTitle = (row[5] ?? "").trim();
    const customRoast = (row[6] ?? "").trim();
    const xHandle = normalizeHandle(row[7] ?? "");
    const o: Override = {};
    if (customLabel) o.customLabel = customLabel;
    if (customTitle) o.customTitle = customTitle;
    if (customRoast) o.customRoast = customRoast;
    if (xHandle) o.xHandle = xHandle;
    if (Object.keys(o).length > 0) {
      overrides[username] = o;
      filled++;
    }
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
}

main();
