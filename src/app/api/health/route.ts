import { NextResponse } from "next/server";

const ATOMD_URL = process.env.ATOMD_URL || "http://localhost:7420";

export async function GET() {
  try {
    const res = await fetch(`${ATOMD_URL}/health`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();
    return NextResponse.json({ dashboard: "ok", atomd: data });
  } catch {
    return NextResponse.json({
      dashboard: "ok",
      atomd: { status: "offline" },
    });
  }
}
