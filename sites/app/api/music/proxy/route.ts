export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const search = new URL(request.url).search;

  try {
    const response = await fetch(`https://u6.y.qq.com/cgi-bin/musics.fcg${search}`, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "text/plain",
        Origin: "https://y.qq.com",
        Referer: "https://y.qq.com/",
        "User-Agent": "Mozilla/5.0",
      },
      body: await request.arrayBuffer(),
      signal: AbortSignal.timeout(10000),
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "QQ Music playback service unavailable" }, { status: 502 });
  }
}
