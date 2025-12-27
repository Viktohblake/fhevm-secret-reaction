// app/api/relayer/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const RELAYER_BASE = "https://relayer.testnet.zama.org/v1";

type RouteContext = {
  params: { path: string[] };
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const url = `${RELAYER_BASE}/${params.path.join("/")}`;
  const r = await fetch(url, { method: "GET" });

  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const url = `${RELAYER_BASE}/${params.path.join("/")}`;
  const body = await req.text();

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": req.headers.get("content-type") ?? "application/json",
    },
    body,
  });

  const out = await r.text();
  return new NextResponse(out, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}
