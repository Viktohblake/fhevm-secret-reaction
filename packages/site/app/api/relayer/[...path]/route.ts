import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // helps on Vercel Pro; harmless locally

const RELAYER_BASE = "https://relayer.testnet.zama.org";

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// IMPORTANT: handle preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  const { path } = ctx.params;
  const url = `${RELAYER_BASE}/v1/${path.join("/")}`;

  const r = await fetch(url, { method: "GET", cache: "no-store" });
  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  const { path } = ctx.params;
  const url = `${RELAYER_BASE}/v1/${path.join("/")}`;
  const body = await req.text();

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": req.headers.get("content-type") ?? "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}
