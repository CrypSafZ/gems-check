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
  joinedAt: string;
  roleIds: string[];
  msg3d: number;
  msg7d: number;
  msg14d: number;
  msg30d: number;
  msgAll: number;
  voiceMinutes?: number;
  voiceRank?: number;
}

export interface SnapshotMeta {
  exportedAt: string;
  totalMembers: number;
  rankedMembers: number;
}

export interface RoleInfo {
  id: string;
  name: string;
  color: number;
  icon: string | null;
  emoji: string | null;
  position: number;
}

export interface Snapshot {
  meta: SnapshotMeta;
  roles: Record<string, RoleInfo>;
  members: MemberSnapshot[];
}

export interface MemberOverride {
  customLabel?: string;
  customTitle?: string;
  customRoast?: string;
  xHandle?: string;
  xHandleAuto?: boolean;
}

export interface OverridesFile {
  pulledAt: string;
  count: number;
  byUsername: Record<string, MemberOverride>;
}
