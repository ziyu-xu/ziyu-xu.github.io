import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import content from "../../data/content.generated.json";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

function findPost(slug: string) {
  return content.posts.find((post) => post.slug === slug || encodeURIComponent(post.slug) === slug);
}

export function generateStaticParams() {
  return content.posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  return post
    ? { title: post.title, description: post.excerpt }
    : { title: "日志未找到" };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = findPost(slug);

  if (!post) notFound();

  return (
    <main className="post-page">
      <article>
        <header className="post-header">
          <Link href="/writing">← 返回日志</Link>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span>{post.date}</span>
            <Link href={`/writing?tag=${encodeURIComponent(post.tag)}`}>{post.tag}</Link>
          </div>
        </header>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    </main>
  );
}
