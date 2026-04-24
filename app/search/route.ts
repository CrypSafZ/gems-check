import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const target = q ? `/${encodeURIComponent(q)}` : "/";
  return NextResponse.redirect(new URL(target, req.url));
}
