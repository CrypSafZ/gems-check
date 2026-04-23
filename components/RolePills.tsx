import Image from "next/image";
import type { RoleInfo } from "@/lib/types";
import { roleColorHex, roleIconUrl } from "@/lib/utils";

export function RolePills({ roles }: { roles: RoleInfo[] }) {
  if (roles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r) => {
        const color = roleColorHex(r.color);
        const icon = roleIconUrl(r.id, r.icon);
        return (
          <span
            key={r.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 ring-1 ring-white/10"
            style={color ? { color, borderColor: color } : undefined}
          >
            {icon ? (
              <Image
                src={icon}
                alt=""
                width={14}
                height={14}
                className="w-3.5 h-3.5 rounded-sm"
                unoptimized
              />
            ) : r.emoji ? (
              <span className="text-[11px] leading-none">{r.emoji}</span>
            ) : (
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: color ?? "rgba(167,139,250,0.6)",
                }}
              />
            )}
            <span className="truncate max-w-[140px]">{r.name}</span>
          </span>
        );
      })}
    </div>
  );
}
