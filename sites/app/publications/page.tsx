import type { Metadata } from "next";
import content from "../data/content.generated.json";

export const metadata: Metadata = {
  title: "发表文章",
  description: "Ziyu Xu 的发表文章。",
};

function AuthorLine({ authors }: { authors: string }) {
  const parts = authors.split("Ziyu Xu");
  return <>{parts.map((part, index) => <span key={`${part}-${index}`}>{part}{index < parts.length - 1 ? <strong>Ziyu Xu</strong> : null}</span>)}</>;
}

export default function PublicationsPage() {
  return (
    <main className="full-publications">
      <header className="page-intro">
        <h1>发表文章</h1>
        <p>按照第一作者、共同第一作者及发表顺序排列。</p>
      </header>
      <ol className="publication-list">
        {content.publications.map((publication) => (
          <li key={publication.title}>
            <div className="publication-year">{publication.year}</div>
            <div>
              <h3><a href={publication.url} target="_blank" rel="noreferrer">{publication.title}</a></h3>
              <p className="authors"><AuthorLine authors={publication.authors} /></p>
              <p className="venue">{publication.venue}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
