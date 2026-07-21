import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "ziyu-xu.github.io";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: {
      default: "Ziyu Xu",
      template: "%s · Ziyu Xu",
    },
    description: "Ziyu Xu 的个人网站：研究、发表文章、实验方法与日志。",
    openGraph: {
      title: "Ziyu Xu",
      description: "Research, publications, experiments, and notes.",
      type: "website",
      images: [new URL("/og.png", base).toString()],
    },
    twitter: {
      card: "summary_large_image",
      title: "Ziyu Xu",
      description: "Research, publications, experiments, and notes.",
      images: [new URL("/og.png", base).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="wordmark">Ziyu Xu</Link>
            <nav aria-label="主导航">
              <Link href="/about">介绍</Link>
              <Link href="/publications">发表文章</Link>
              <Link href="/writing">日志</Link>
              <a href="https://ziyu-xu.github.io" target="_blank" rel="noreferrer">Hexo</a>
            </nav>
          </header>
          {children}
          <footer className="site-footer">
            <span>© {new Date().getFullYear()} Ziyu Xu</span>
            <span>内容与 Hexo 共用同一份 Markdown</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
