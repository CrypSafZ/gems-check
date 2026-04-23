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

const snapshot = snapshotJson as Snapshot;
const overrides = overridesJson as OverridesFile;

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
    if (r) out.push(r);
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
