import type { Metadata } from "next";
import content from "../data/content.generated.json";

export const metadata: Metadata = {
  title: "介绍",
  description: "关于 Ziyu Xu。",
};

export default function AboutPage() {
  return (
    <main>
      <header className="page-intro">
        <h1>介绍</h1>
        <p>研究、实验和一些值得记下来的事情。</p>
      </header>
      <section className="prose">
        {content.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
    </main>
  );
}
