import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RELAYER_BASE = "https://relayer.testnet.zama.org/v1";

// Next.js 15: ctx.params is a Promise, and should be typed with RouteContext<...>
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/relayer/[...path]">) {
  const { path } = await ctx.params;
  const url = `${RELAYER_BASE}/${path.join("/")}`;

  const r = await fetch(url, { method: "GET" });
  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/relayer/[...path]">) {
  const { path } = await ctx.params;
  const url = `${RELAYER_BASE}/${path.join("/")}`;
  const body = await req.text();

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": req.headers.get("content-type") ?? "application/json",
    },
    body,
  });

  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}
