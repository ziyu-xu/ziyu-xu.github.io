"use client";

import Link from "next/link";
import { useRef } from "react";

type Topic = {
  name: string;
  count: number;
};

export default function HeroTopics({ postsCount, topics }: { postsCount: number; topics: Topic[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className="hero-stats" aria-label="网站内容概览">
        <Link href="/writing" className="hero-stat-control">
          <span className="summary-number">{postsCount}</span>
          <span className="summary-label">篇日志</span>
        </Link>
        <button
          type="button"
          className="hero-stat-control"
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
        >
          <span className="summary-number">{topics.length}</span>
          <span className="summary-label">个内容主题</span>
        </button>
      </div>

      <dialog ref={dialogRef} className="topic-dialog" aria-labelledby="topic-dialog-title">
        <div className="topic-dialog-header">
          <h2 id="topic-dialog-title">选择内容主题</h2>
          <button type="button" onClick={() => dialogRef.current?.close()}>关闭</button>
        </div>
        <nav className="topic-links" aria-label="内容主题">
          {topics.map((topic) => (
            <Link
              key={topic.name}
              href={`/writing?tag=${encodeURIComponent(topic.name)}`}
              onClick={() => dialogRef.current?.close()}
            >
              <span>{topic.name}</span>
              <span>{topic.count} 篇</span>
            </Link>
          ))}
        </nav>
      </dialog>
    </>
  );
}
