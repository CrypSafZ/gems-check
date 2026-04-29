import snapshotJson from "../data/snapshot.json";
import overridesJson from "../data/overrides.json";
import type {
  MemberOverride,
  MemberSnapshot,
  OverridesFile,
  RoleInfo,
  Snapshot,
  SnapshotMeta,
} from "./types";

const EMPTY_SNAPSHOT: Snapshot = {
  meta: { exportedAt: "", totalMembers: 0, rankedMembers: 0 },
  roles: {},
  members: [],
};
const EMPTY_OVERRIDES: OverridesFile = {
  pulledAt: "",
  count: 0,
  byUsername: {},
};

function loadSnapshot(): Snapshot {
  const raw = snapshotJson as Partial<Snapshot> | null | undefined;
  if (!raw || !Array.isArray(raw.members) || !raw.meta || !raw.roles) {
    console.warn("[gems-check] snapshot.json malformed — serving empty dataset");
    return EMPTY_SNAPSHOT;
  }
  return raw as Snapshot;
}

function loadOverrides(): OverridesFile {
  const raw = overridesJson as Partial<OverridesFile> | null | undefined;
  if (!raw || !raw.byUsername || typeof raw.byUsername !== "object") {
    console.warn("[gems-check] overrides.json malformed — no overrides applied");
    return EMPTY_OVERRIDES;
  }
  return raw as OverridesFile;
}

const snapshot = loadSnapshot();
const overrides = loadOverrides();

const byId = new Map(snapshot.members.map((m) => [m.id, m]));
const byUsername = new Map(
  snapshot.members.map((m) => [m.username.toLowerCase(), m]),
);

const MAX_QUERY_LEN = 64;

export function normalizeQuery(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw.trim().slice(0, MAX_QUERY_LEN);
}

export function lookupMember(query: string): MemberSnapshot | null {
  const q = normalizeQuery(query).toLowerCase();
  if (!q) return null;

  return byId.get(q) ?? byUsername.get(q) ?? null;
}

export function lookupOverride(
  username: string | undefined | null,
): MemberOverride | null {
  if (!username) return null;
  return overrides.byUsername[username.toLowerCase()] ?? null;
}

export function getRoles(ids: string[]): RoleInfo[] {
  const out: RoleInfo[] = [];
  for (const id of ids) {
    const r = snapshot.roles[id];
    if (r) {
      // 1. Remove anything "ethos" from the roles
      const name = r.name.toLowerCase();
      if (
        name.includes("ethos") ||
        name.includes("purpleethos") ||
        name.includes("greenethos") ||
        name.includes("verified ethos")
      ) {
        continue;
      }
      out.push(r);
    }
  }
  out.sort((a, b) => b.position - a.position);
  return out;
}

export function getMeta(): SnapshotMeta {
  return snapshot.meta;
}

export function allMembers(): MemberSnapshot[] {
  return snapshot.members;
}
