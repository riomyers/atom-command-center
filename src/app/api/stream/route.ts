const ATOMD_URL = process.env.ATOMD_URL || "http://localhost:7420";
const ATOMD_TOKEN = process.env.ATOMD_TOKEN || "";

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const upstream = await fetch(`${ATOMD_URL}/api/v1/brain/stream`, {
      headers: { Authorization: `Bearer ${ATOMD_TOKEN}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

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
  } catch (e) {
    clearTimeout(timeout);
    const msg = e instanceof DOMException && e.name === "AbortError"
      ? "atomd SSE connection timed out"
      : "atomd unreachable";
    return new Response(msg, { status: 502 });
  }
}
