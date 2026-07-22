import type { Metadata } from "next";
import content from "../data/content.generated.json";

export const metadata: Metadata = {
  title: "日志",
  description: "实验方法、文献阅读、游戏和日常记录。",
};

export default function WritingPage() {
  return (
    <main className="full-writing">
      <header className="page-intro">
        <h1>日志</h1>
        <p>实验方法、文献阅读、数据处理、游戏和日常。</p>
      </header>
      <div className="post-list">
        {content.posts.map((post) => (
          <a key={post.url} href={post.url} target="_blank" rel="noreferrer" className="post-row">
            <span className="post-date">{post.date}</span>
            <span className="post-title">{post.title}</span>
            <span className="post-tag">{post.tag}</span>
          </a>
        ))}
      </div>
    </main>
  );
}
