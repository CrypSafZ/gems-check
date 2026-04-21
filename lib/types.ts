export type TierId =
  | "emperor"
  | "podium"
  | "hall"
  | "elite"
  | "inner"
  | "shiny"
  | "regular"
  | "dweller"
  | "ghost"
  | "notagem";

export interface Tier {
  id: TierId;
  label: string;
  title: string;
  roast: string;
  glow: string;
  ring: string;
  badge: string;
}

export interface MemberSnapshot {
  id: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  rank: number;
  msg3d: number;
  msg7d: number;
  msg14d: number;
  msg30d: number;
  msgAll: number;
}

export interface SnapshotMeta {
  exportedAt: string;
  totalMembers: number;
  rankedMembers: number;
}

export interface Snapshot {
  meta: SnapshotMeta;
  members: MemberSnapshot[];
}
