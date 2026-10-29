import { env } from "cloudflare:workers";

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visited_at INTEGER NOT NULL,
    path TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    country TEXT,
    region TEXT,
    city TEXT,
    referrer TEXT
  )
`;

export async function ensureAnalyticsSchema() {
  await env.DB.batch([
    env.DB.prepare(CREATE_TABLE),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views(visited_at)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_page_views_path_visited_at ON page_views(path, visited_at)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_page_views_visitor_hash ON page_views(visitor_hash)"),
  ]);
}
