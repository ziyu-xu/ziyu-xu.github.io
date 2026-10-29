import type { Metadata } from "next";
import Link from "next/link";
import content from "../data/content.generated.json";

export const metadata: Metadata = {
  title: "日志",
  description: "实验方法、文献阅读、游戏和日常记录。",
};

type WritingPageProps = {
  searchParams: Promise<{ tag?: string | string[] }>;
};

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const params = await searchParams;
  const requestedTag = Array.isArray(params.tag) ? params.tag[0] : params.tag;
  const selectedTag = requestedTag && content.tags.includes(requestedTag) ? requestedTag : "";
  const posts = selectedTag ? content.posts.filter((post) => post.tag === selectedTag) : content.posts;

  return (
    <main className="full-writing">
      <header className="page-intro">
        <h1>{selectedTag ? `日志 · ${selectedTag}` : "日志"}</h1>
        <p>
          {selectedTag ? `${selectedTag} 主题，共 ${posts.length} 篇。` : "实验方法、文献阅读、数据处理、游戏和日常。"}
          {selectedTag ? <> <Link href="/writing">查看全部日志</Link></> : null}
        </p>
      </header>
      <div className="post-list">
        {posts.map((post) => (
          <Link key={post.slug} href={`/writing/${encodeURIComponent(post.slug)}`} className="post-row">
            <span className="post-date">{post.date}</span>
            <span className="post-title">{post.title}</span>
            <span className="post-tag">{post.tag}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
