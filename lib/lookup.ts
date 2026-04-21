import snapshotJson from "../data/snapshot.json";
import type { MemberSnapshot, Snapshot, SnapshotMeta } from "./types";

const snapshot = snapshotJson as Snapshot;

const byId = new Map(snapshot.members.map((m) => [m.id, m]));
const byUsername = new Map(
  snapshot.members.map((m) => [m.username.toLowerCase(), m]),
);

export function lookupMember(query: string): MemberSnapshot | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  if (!q) return null;

  return byId.get(q) ?? byUsername.get(q) ?? null;
}

export function getMeta(): SnapshotMeta {
  return snapshot.meta;
}

export function allMembers(): MemberSnapshot[] {
  return snapshot.members;
}
