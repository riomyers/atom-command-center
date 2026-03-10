import { NextRequest } from "next/server";

const ATOMD_URL = process.env.ATOMD_URL || "http://localhost:7420";
const ATOMD_TOKEN = process.env.ATOMD_TOKEN || "";

export async function GET(req: NextRequest) {
  const dashToken = req.nextUrl.searchParams.get("token");
  const expectedToken = process.env.DASHBOARD_TOKEN || "";
  if (expectedToken && dashToken !== expectedToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const upstream = await fetch(`${ATOMD_URL}/api/v1/brain/stream`, {
      headers: { Authorization: `Bearer ${ATOMD_TOKEN}` },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to connect to atomd SSE", { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response("atomd unreachable", { status: 502 });
  }
}
