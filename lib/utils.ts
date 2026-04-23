import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function roleColorHex(color: number): string | null {
  if (!color) return null;
  return `#${color.toString(16).padStart(6, "0")}`;
}

export function roleIconUrl(
  roleId: string,
  iconHash: string | null,
): string | null {
  if (!iconHash) return null;
  return `https://cdn.discordapp.com/role-icons/${roleId}/${iconHash}.png?size=32`;
}

export function formatVoiceHours(minutes: number | undefined): string {
  if (!minutes || minutes < 1) return "—";
  const hours = minutes / 60;
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours).toLocaleString("en-US")}h`;
}
