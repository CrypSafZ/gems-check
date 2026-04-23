import { NextResponse, type NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const MAX_BUCKETS = 10_000;
const LIMITS: Record<string, number> = {
  card: 30,
};

const buckets = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string | null {
  // Vercel signs and rewrites this header at the edge — safe to trust.
  // User-supplied x-forwarded-for is spoofable, so we ignore it.
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

function evictExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size > MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

export function enforceRateLimit(
  req: NextRequest,
  route: string,
): NextResponse | null {
  const limit = LIMITS[route] ?? 60;
  const ip = getIp(req);
  const now = Date.now();

  if (!ip) {
    const key = `${route}:anon`;
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      if (buckets.size > MAX_BUCKETS) evictExpired(now);
      return null;
    }
    if (bucket.count >= limit) {
      return rateLimitedResponse(bucket.resetAt - now, limit, bucket.resetAt);
    }
    bucket.count += 1;
    return null;
  }

  const key = `${route}:${ip}`;

  if (buckets.size > MAX_BUCKETS) evictExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (bucket.count >= limit) {
    return rateLimitedResponse(bucket.resetAt - now, limit, bucket.resetAt);
  }

  bucket.count += 1;
  return null;
}

function rateLimitedResponse(
  remainingMs: number,
  limit: number,
  resetAt: number,
): NextResponse {
  const retryAfter = Math.ceil(remainingMs / 1000);
  return new NextResponse("rate limited — slow your roll 💎", {
    status: 429,
    headers: {
      "Retry-After": String(retryAfter),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    },
  });
}
