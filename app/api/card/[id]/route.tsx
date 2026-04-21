import { ImageResponse } from "next/og";
import { getMeta, lookupMember } from "@/lib/lookup";
import { tierForRank } from "@/lib/tiers";
import { formatNumber } from "@/lib/utils";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 675;

const TIER_GRADIENTS: Record<string, [string, string]> = {
  emperor: ["#ec4899", "#7c3aed"],
  podium: ["#a855f7", "#6d28d9"],
  hall: ["#a78bfa", "#5b21b6"],
  elite: ["#818cf8", "#5b21b6"],
  inner: ["#8b5cf6", "#4338ca"],
  shiny: ["#818cf8", "#2563eb"],
  regular: ["#60a5fa", "#4338ca"],
  dweller: ["#7c3aed", "#4c1d95"],
  ghost: ["#64748b", "#3b0764"],
  notagem: ["#e11d48", "#1f2937"],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = enforceRateLimit(req, "card");
  if (limited) return limited;

  const { id } = await params;
  const query = decodeURIComponent(id);
  const member = lookupMember(query);
  const meta = getMeta();
  const tier = tierForRank(member?.rank ?? null);
  const [gradStart, gradEnd] = TIER_GRADIENTS[tier.id] ?? [
    "#8b5cf6",
    "#1a0b2e",
  ];

  const displayName = member ? `@${member.username}` : `@${query}`;
  const subLine = member
    ? `rank #${member.rank} of ${formatNumber(meta.totalMembers)}`
    : "Not found in the cave";

  const stats = member
    ? [
        { label: "3D", value: formatNumber(member.msg3d) },
        { label: "7D", value: formatNumber(member.msg7d) },
        { label: "14D", value: formatNumber(member.msg14d) },
        { label: "30D", value: formatNumber(member.msg30d) },
        { label: "ALL", value: formatNumber(member.msgAll) },
      ]
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0a0514 0%, #1a0b2e 50%, #0a0514 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${gradStart}55 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 80%, ${gradEnd}44 0%, transparent 60%)`,
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: 56,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {member ? (
                <img
                  src={
                    member.pfpUrl.startsWith("/")
                      ? `${req.nextUrl.origin}${member.pfpUrl}`
                      : member.pfpUrl
                  }
                  width={128}
                  height={128}
                  style={{
                    borderRadius: "50%",
                    border: `4px solid ${gradStart}`,
                    boxShadow: `0 0 40px ${gradStart}88`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 64,
                    color: "#f5f3ff",
                  }}
                >
                  ?
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  maxWidth: 560,
                }}
              >
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 700,
                    color: "#f5f3ff",
                    lineHeight: 1,
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: "#a78bfa",
                    fontFamily: "monospace",
                  }}
                >
                  {subLine}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
                color: "#f5f3ff",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                boxShadow: `0 8px 32px ${gradStart}55`,
              }}
            >
              {tier.label}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontStyle: "italic",
              color: "#f5f3ffee",
              lineHeight: 1.3,
              maxWidth: 1000,
            }}
          >
            &ldquo;{tier.roast}&rdquo;
          </div>

          {stats && (
            <div style={{ display: "flex", gap: 16, width: "100%" }}>
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "18px 20px",
                    borderRadius: 18,
                    background: "rgba(139, 92, 246, 0.12)",
                    border: "1px solid rgba(167, 139, 250, 0.25)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      color: "#a78bfa",
                      fontFamily: "monospace",
                      letterSpacing: 2,
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 40,
                      color: "#f5f3ff",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              color: "#a78bfa88",
              fontFamily: "monospace",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex" }}>0xAlphaGEMs · gems-check.lol</div>
            <div style={{ display: "flex" }}>
              {new Date(meta.exportedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    },
  );
}
