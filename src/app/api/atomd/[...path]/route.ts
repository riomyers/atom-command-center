import { NextRequest, NextResponse } from "next/server";

const ATOMD_URL = process.env.ATOMD_URL || "http://localhost:7420";
const ATOMD_TOKEN = process.env.ATOMD_TOKEN || "";
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || "";

function checkAuth(req: NextRequest): boolean {
  if (!DASHBOARD_TOKEN) return true;
  const auth = req.headers.get("x-dashboard-token");
  return auth === DASHBOARD_TOKEN;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const targetPath = path.join("/");
  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${ATOMD_URL}/api/v1/${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ATOMD_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Failed to reach atomd: ${e}` },
      { status: 502 }
    );
  }
}
