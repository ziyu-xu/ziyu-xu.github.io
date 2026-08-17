import { env } from "cloudflare:workers";
import { ensureAnalyticsSchema } from "../../../../db/analytics";

export const dynamic = "force-dynamic";

type CloudflareRequest = Request & {
  cf?: { country?: string; region?: string; city?: string };
};

function cleanPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.length > 300) return "/";
  return value.split(/[?#]/, 1)[0];
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.slice(0, maxLength) : null;
}

async function visitorHash(request: Request) {
  const ip = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]
    ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const input = new TextEncoder().encode(`${env.ANALYTICS_HASH_SALT}:${ip}:${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  let payload: { path?: unknown; referrer?: unknown } = {};
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const cf = (request as CloudflareRequest).cf;
  await ensureAnalyticsSchema();
  await env.DB.prepare(
    `INSERT INTO page_views
      (visited_at, path, visitor_hash, country, region, city, referrer)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    Date.now(),
    cleanPath(payload.path),
    await visitorHash(request),
    cleanText(cf?.country ?? request.headers.get("cf-ipcountry"), 80),
    cleanText(cf?.region, 120),
    cleanText(cf?.city, 120),
    cleanText(payload.referrer, 500),
  ).run();

  if (Math.random() < 0.02) {
    await env.DB.prepare("DELETE FROM page_views WHERE visited_at < ?")
      .bind(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .run();
  }

  return new Response(null, { status: 204 });
}
