import { NextResponse, type NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const LIMITS: Record<string, number> = {
  card: 30,
};

const buckets = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function enforceRateLimit(
  req: NextRequest,
  route: string,
): NextResponse | null {
  const limit = LIMITS[route] ?? 60;
  const ip = getIp(req);
  const key = `${route}:${ip}`;
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return new NextResponse("rate limited — slow your roll 💎", {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
      },
    });
  }

  bucket.count += 1;
  return null;
}
