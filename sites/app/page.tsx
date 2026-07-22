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
        <div className="hero-overview">
          <h1>Ziyu Xu</h1>
          <div className="hero-stats" aria-label="网站内容概览">
            <div>
              <span className="summary-number">{content.posts.length}</span>
              <span className="summary-label">篇日志</span>
            </div>
            <div>
              <span className="summary-number">{content.tags.length}</span>
              <span className="summary-label">个内容主题</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
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
