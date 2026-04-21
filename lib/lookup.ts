import { MOCK_MEMBERS, MOCK_META } from "./mock";
import type { MemberSnapshot, SnapshotMeta } from "./types";

export function lookupMember(query: string): MemberSnapshot | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const byId = MOCK_MEMBERS.find((m) => m.id === q);
  if (byId) return byId;

  const byUsername = MOCK_MEMBERS.find((m) => m.username.toLowerCase() === q);
  if (byUsername) return byUsername;

  return null;
}

export function getMeta(): SnapshotMeta {
  return MOCK_META;
}
