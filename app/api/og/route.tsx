import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getMeta } from "@/lib/lookup";
import { formatNumber } from "@/lib/utils";

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 675;

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const gemSrc = `${origin}/brand/gem.jpg`;
  const meta = getMeta();

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
          padding: 64,
          background:
            "linear-gradient(135deg, #0a0514 0%, #1a0b2e 50%, #0a0514 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139, 92, 246, 0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 80%, rgba(236, 72, 153, 0.30) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            textAlign: "center",
          }}
        >
          <img
            src={gemSrc}
            width={180}
            height={180}
            style={{
              borderRadius: "50%",
              border: "6px solid #a78bfa",
              boxShadow: "0 0 64px rgba(139, 92, 246, 0.6)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 900,
                color: "#f5f3ff",
                letterSpacing: -1,
                lineHeight: 0.95,
                textTransform: "uppercase",
              }}
            >
              GEM Unemployment
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 60,
                fontStyle: "italic",
                fontWeight: 600,
                color: "#c4b5fd",
                letterSpacing: -1,
                lineHeight: 1,
              }}
            >
              checker
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#e9dbff",
              fontWeight: 600,
              maxWidth: 980,
            }}
          >
            Are you a GEM, or just a lurker?
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 28px",
              borderRadius: 999,
              background: "#ffffff",
              color: "#1a0b2e",
              fontWeight: 900,
              fontSize: 26,
              letterSpacing: 0.5,
              boxShadow: "0 0 0 6px rgba(255,255,255,0.2), 0 16px 48px rgba(236, 72, 153, 0.4)",
            }}
          >
            <span>Made by @0xAlphaGEMs</span>
            <img
              src={gemSrc}
              width={32}
              height={32}
              style={{
                borderRadius: "50%",
                border: "2px solid rgba(167, 139, 250, 0.7)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#a78bfaaa",
              fontFamily: "monospace",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {formatNumber(meta.totalMembers)} gems tracked · gems-check.lol
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
