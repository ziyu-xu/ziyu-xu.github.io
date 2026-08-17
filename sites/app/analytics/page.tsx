import { env } from "cloudflare:workers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";
import { ensureAnalyticsSchema } from "../../db/analytics";

export const dynamic = "force-dynamic";

type Summary = { views: number; visitors: number; today: number };
type PageRow = { path: string; views: number };
type VisitRow = {
  visited_at: number;
  path: string;
  country: string | null;
  region: string | null;
  city: string | null;
};

async function AnalyticsContent() {
  const user = await requireChatGPTUser("/analytics");
  if (user.email.toLowerCase() !== env.ANALYTICS_ADMIN_EMAIL.toLowerCase()) notFound();
  await ensureAnalyticsSchema();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const summary = await env.DB.prepare(
    `SELECT COUNT(*) AS views,
            COUNT(DISTINCT visitor_hash) AS visitors,
            SUM(CASE WHEN visited_at >= ? THEN 1 ELSE 0 END) AS today
     FROM page_views`,
  ).bind(today.getTime()).first<Summary>() ?? { views: 0, visitors: 0, today: 0 };

  const pages = await env.DB.prepare(
    `SELECT path, COUNT(*) AS views
     FROM page_views GROUP BY path ORDER BY views DESC LIMIT 10`,
  ).all<PageRow>();

  const recent = await env.DB.prepare(
    `SELECT visited_at, path, country, region, city
     FROM page_views ORDER BY visited_at DESC LIMIT 30`,
  ).all<VisitRow>();

  return (
    <main className="analytics-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PRIVATE</p>
          <h1>访问统计</h1>
        </div>
        <Link href="/">返回主页</Link>
      </div>

      <section className="analytics-summary" aria-label="统计摘要">
        <div><strong>{summary.views ?? 0}</strong><span>浏览次数</span></div>
        <div><strong>{summary.visitors ?? 0}</strong><span>独立访客</span></div>
        <div><strong>{summary.today ?? 0}</strong><span>今日浏览</span></div>
      </section>

      <section className="analytics-grid">
        <div>
          <h2>热门页面</h2>
          <ol className="analytics-list">
            {pages.results.map((item) => (
              <li key={item.path}><span>{item.path}</span><strong>{item.views}</strong></li>
            ))}
          </ol>
        </div>
        <div>
          <h2>最近访问</h2>
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead><tr><th>时间</th><th>页面</th><th>地区</th></tr></thead>
              <tbody>
                {recent.results.map((item, index) => (
                  <tr key={`${item.visited_at}-${item.path}-${index}`}>
                    <td>{new Date(item.visited_at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</td>
                    <td>{item.path}</td>
                    <td>{[item.city, item.region, item.country].filter(Boolean).join(" · ") || "未知"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <p className="analytics-note">数据保留 90 天；IP 仅用于生成匿名访客标识，不保存原始地址。</p>
    </main>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
