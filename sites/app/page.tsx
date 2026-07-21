import Link from "next/link";
import content from "./data/content.generated.json";

function AuthorLine({ authors }: { authors: string }) {
  const parts = authors.split("Ziyu Xu");
  return (
    <span>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}
          {index < parts.length - 1 ? <strong>Ziyu Xu</strong> : null}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  const featuredPublications = content.publications.slice(0, 3);
  const latestPosts = content.posts.slice(0, 5);

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">学生 · 生物化学研究 · 科学写作</p>
        <h1>Ziyu Xu</h1>
        <p className="hero-lead">
          记录核小体修饰与泛素化相关研究，也写实验方法、文献阅读和日常。
        </p>
        <p className="motto">坐看日月行，细数千帆过。</p>
        <div className="hero-actions">
          <Link href="/publications">发表文章</Link>
          <Link href="/writing" className="quiet-link">阅读日志</Link>
        </div>
      </section>

      <section className="summary-grid" aria-label="网站内容概览">
        <div>
          <span className="summary-number">{content.publications.length}</span>
          <span className="summary-label">篇发表文章</span>
        </div>
        <div>
          <span className="summary-number">{content.posts.length}</span>
          <span className="summary-label">篇日志</span>
        </div>
        <div>
          <span className="summary-number">{content.tags.length}</span>
          <span className="summary-label">个内容主题</span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2>发表文章</h2>
          </div>
          <Link href="/publications">查看全部</Link>
        </div>
        <ol className="publication-list compact-list">
          {featuredPublications.map((publication) => (
            <li key={publication.title}>
              <div className="publication-year">{publication.year}</div>
              <div>
                <h3>
                  <a href={publication.url} target="_blank" rel="noreferrer">
                    {publication.title}
                  </a>
                </h3>
                <p className="authors"><AuthorLine authors={publication.authors} /></p>
                <p className="venue">{publication.venue}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent notes</p>
            <h2>最近日志</h2>
          </div>
          <Link href="/writing">查看全部</Link>
        </div>
        <div className="post-list">
          {latestPosts.map((post) => (
            <a key={post.url} href={post.url} target="_blank" rel="noreferrer" className="post-row">
              <span className="post-date">{post.date}</span>
              <span className="post-title">{post.title}</span>
              <span className="post-tag">{post.tag}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
