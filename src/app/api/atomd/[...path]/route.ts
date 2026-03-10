import { NextRequest, NextResponse } from "next/server";

const ATOMD_URL = process.env.ATOMD_URL || "http://localhost:7420";
const ATOMD_TOKEN = process.env.ATOMD_TOKEN || "";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join("/");
  const body = await req.json().catch(() => ({}));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${ATOMD_URL}/api/v1/${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ATOMD_TOKEN}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof DOMException && e.name === "AbortError"
      ? "atomd request timed out (10s)"
      : `Failed to reach atomd: ${e}`;
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
