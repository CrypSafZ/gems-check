import { ImageResponse } from "next/og";
import {
  getMeta,
  getRoles,
  lookupMember,
  lookupOverride,
  normalizeQuery,
} from "@/lib/lookup";
import { tierForRank } from "@/lib/tiers";
import { formatNumber, formatVoiceHours, roleColorHex } from "@/lib/utils";
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

// Only allow PFPs from known hosts we trust.
// This stops SSRF via @vercel/og fetching arbitrary URLs server-side.
const ALLOWED_PFP_SOURCES: Array<{
  hostnameSuffix: string;
  pathPrefix: string;
}> = [
  { hostnameSuffix: ".public.blob.vercel-storage.com", pathPrefix: "/pfps/" },
  { hostnameSuffix: "cdn.discordapp.com", pathPrefix: "/avatars/" },
];

function isAllowedPfpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_PFP_SOURCES.some(
      (s) =>
        parsed.hostname.endsWith(s.hostnameSuffix) &&
        parsed.pathname.startsWith(s.pathPrefix),
    );
  } catch {
    return false;
  }
}

function stripLeadingNonAlpha(s: string): string {
  return s.replace(/^[^A-Za-z]+/, "").trim();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = enforceRateLimit(req, "card");
  if (limited) return limited;

  const { id } = await params;
  const query = normalizeQuery(id);
  const member = lookupMember(query);
  const meta = getMeta();
  const override = lookupOverride(member?.username ?? query);
  const baseTier = tierForRank(member?.rank ?? null);
  const tier = {
    ...baseTier,
    label: override?.customLabel?.trim() || baseTier.label,
    title: override?.customTitle?.trim() || baseTier.title,
    roast: override?.customRoast?.trim() || baseTier.roast,
  };
  const tierLabel = stripLeadingNonAlpha(tier.label);
  const [gradStart, gradEnd] = TIER_GRADIENTS[tier.id] ?? [
    "#8b5cf6",
    "#1a0b2e",
  ];

  const safeQuery = query || "unknown";
  const displayName = member ? `@${member.username}` : `@${safeQuery}`;
  const subLine = member
    ? `rank #${member.rank} of ${formatNumber(meta.totalMembers)}`
    : "Not found in the cave";
  const joinedLine = member
    ? `Member since ${new Date(member.joinedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : null;

  const MAX_ROLES_ON_CARD = 10;
  const allRoles = member ? getRoles(member.roleIds) : [];
  const visibleRoles = allRoles.slice(0, MAX_ROLES_ON_CARD);
  const hiddenRoleCount = allRoles.length - visibleRoles.length;

  const pfpSrc = member && isAllowedPfpUrl(member.pfpUrl) ? member.pfpUrl : null;

  const hasVoice = !!member?.voiceMinutes && member.voiceMinutes > 0;
  const stats = member
    ? [
        { label: "3D", value: formatNumber(member.msg3d) },
        { label: "7D", value: formatNumber(member.msg7d) },
        { label: "14D", value: formatNumber(member.msg14d) },
        { label: "30D", value: formatNumber(member.msg30d) },
        { label: "ALL", value: formatNumber(member.msgAll) },
        ...(hasVoice
          ? [{ label: "VC", value: formatVoiceHours(member.voiceMinutes) }]
          : []),
      ]
    : null;

  const STAT_FONT_SIZE = hasVoice ? 24 : 28;

  if (!member) {
    return renderNotAGemCard(safeQuery, gradStart, gradEnd, req);
  }

  try {
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
              <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                {pfpSrc ? (
                  <img
                    src={pfpSrc}
                    width={240}
                    height={240}
                    style={{
                      borderRadius: "50%",
                      border: `6px solid ${gradStart}`,
                      boxShadow: `0 0 56px ${gradStart}aa`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 240,
                      height: 240,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 120,
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
                    maxWidth: 620,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 58,
                      fontWeight: 800,
                      color: "#f5f3ff",
                      lineHeight: 1,
                    }}
                  >
                    {displayName}
                  </div>
                  {override?.xHandle && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 16px",
                        borderRadius: 999,
                        background: "rgba(139, 92, 246, 0.22)",
                        border: "2px solid rgba(167, 139, 250, 0.55)",
                        alignSelf: "flex-start",
                        marginTop: 4,
                      }}
                    >
                      <span style={{ color: "#e9dbff", fontSize: 26 }}>𝕏</span>
                      <span
                        style={{
                          fontSize: 24,
                          color: "#e9dbff",
                          fontFamily: "monospace",
                          fontWeight: 700,
                          letterSpacing: 0.5,
                        }}
                      >
                        @{override.xHandle}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 24,
                      color: "#c4b5fd",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    {subLine}
                  </div>
                  {joinedLine && (
                    <div
                      style={{
                        fontSize: 18,
                        color: "#a78bfa",
                        fontFamily: "monospace",
                        fontWeight: 500,
                      }}
                    >
                      {joinedLine}
                    </div>
                  )}
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
                {tierLabel}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontStyle: "italic",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.25,
                maxWidth: 1060,
                textShadow: "0 2px 18px rgba(10, 5, 20, 0.65)",
              }}
            >
              &ldquo;{tier.roast}&rdquo;
            </div>

            {visibleRoles.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  maxWidth: 1080,
                }}
              >
                {visibleRoles.map((r) => {
                  const color = roleColorHex(r.color) ?? "#c4b5fd";
                  return (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 999,
                        background: "rgba(255, 255, 255, 0.06)",
                        border: `1px solid ${color}66`,
                      }}
                    >
                      {r.emoji ? (
                        <span style={{ fontSize: 18 }}>{r.emoji}</span>
                      ) : (
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: color,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color,
                          letterSpacing: 0.3,
                        }}
                      >
                        {r.name}
                      </span>
                    </div>
                  );
                })}
                {hiddenRoleCount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(167, 139, 250, 0.4)",
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#c4b5fd",
                    }}
                  >
                    +{hiddenRoleCount} more
                  </div>
                )}
              </div>
            )}

            {stats && (
              <div style={{ display: "flex", gap: 14, width: "100%" }}>
                {stats.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: "16px 14px",
                      borderRadius: 18,
                      background: "rgba(139, 92, 246, 0.12)",
                      border: "1px solid rgba(167, 139, 250, 0.25)",
                      overflow: "hidden",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        color: "#c4b5fd",
                        fontFamily: "monospace",
                        letterSpacing: 2,
                        fontWeight: 700,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: STAT_FONT_SIZE,
                        color: "#f5f3ff",
                        fontWeight: 800,
                        fontFamily: "monospace",
                        lineHeight: 1,
                        whiteSpace: "nowrap",
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
                alignItems: "center",
                fontSize: 20,
                color: "#e9dbff",
                fontFamily: "monospace",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 30px",
                  borderRadius: 999,
                  background: "#ffffff",
                  border: "3px solid #ffffff",
                  color: "#1a0b2e",
                  fontWeight: 900,
                  fontSize: 32,
                  letterSpacing: 1,
                  boxShadow:
                    "0 0 0 8px rgba(255, 255, 255, 0.25), 0 0 48px rgba(255, 255, 255, 0.6), 0 16px 48px rgba(236, 72, 153, 0.5)",
                }}
              >
                <span style={{ color: "#1a0b2e", fontSize: 36 }}>𝕏</span>
                <span>@0xAlphaGEMs</span>
              </div>
              <div style={{ display: "flex", color: "#a78bfaaa", fontSize: 16 }}>
                gems-check.lol ·{" "}
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
  } catch {
    return renderFallback(safeQuery, tierLabel, tier.roast, gradStart, gradEnd);
  }
}

function renderNotAGemCard(
  name: string,
  gradStart: string,
  gradEnd: string,
  req: NextRequest,
): ImageResponse {
  const origin = new URL(req.url).origin;
  const exitSrc = `${origin}/brand/exit-guy.jpg`;
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
            background: `radial-gradient(ellipse 70% 60% at 30% 40%, ${gradStart}55 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 80%, ${gradEnd}55 0%, transparent 60%)`,
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            padding: 56,
            boxSizing: "border-box",
            gap: 40,
            alignItems: "center",
          }}
        >
          <img
            src={exitSrc}
            width={440}
            height={440}
            style={{
              borderRadius: 28,
              objectFit: "cover",
              border: `5px solid ${gradStart}`,
              boxShadow: `0 0 64px ${gradStart}aa`,
              flexShrink: 0,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 24,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 32,
                color: "#c4b5fd",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              @{name}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 92,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 0.95,
                textShadow: "0 4px 24px rgba(225, 29, 72, 0.45)",
              }}
            >
              <span>Who tf</span>
              <span>are you?</span>
              <span style={{ color: "#fca5a5" }}>Get out.</span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 40,
              right: 56,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 24px",
              borderRadius: 999,
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(236, 72, 153, 0.25))",
              border: "2px solid rgba(167, 139, 250, 0.7)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 24,
              boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
              fontFamily: "monospace",
            }}
          >
            <span style={{ color: "#ffffff", fontSize: 28 }}>𝕏</span>
            <span>@0xAlphaGEMs</span>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=600" },
    },
  );
}

function renderFallback(
  name: string,
  tierLabel: string,
  roast: string,
  gradStart: string,
  gradEnd: string,
): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 56,
          background: `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)`,
          fontFamily: "sans-serif",
          color: "#f5f3ff",
        }}
      >
        <div style={{ display: "flex", fontSize: 48, fontWeight: 700 }}>
          @{name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 24,
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          {tierLabel}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            marginTop: 20,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          &ldquo;{roast}&rdquo;
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 14,
            marginTop: 40,
            fontFamily: "monospace",
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          0xAlphaGEMs · gems-check.lol
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: { "Cache-Control": "public, max-age=60" },
    },
  );
}
