import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const siteRoot = process.cwd();
const repoRoot = path.resolve(siteRoot, "..");
const sourceRoot = path.join(repoRoot, "source");

function splitDocument(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: text };
  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    frontmatter[key] = value;
  }
  return { frontmatter, body: match[2].trim() };
}

function plainText(markdown) {
  return markdown
    .replace(/<!--more-->/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolvePostAssets(markdown, baseUrl) {
  const resolveUrl = (url) => {
    const value = url.trim();
    return /^(?:[a-z][a-z+.-]*:|\/|#)/i.test(value) ? value : `${baseUrl}${value}`;
  };

  return markdown
    .replace(/(!\[[^\]]*\]\()([^)\s]+)([^)]*\))/g, (_, opening, url, closing) => `${opening}${resolveUrl(url)}${closing}`)
    .replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, (_, opening, url, closing) => `${opening}${resolveUrl(url)}${closing}`);
}

async function readPosts() {
  const postsDir = path.join(sourceRoot, "_posts");
  const files = (await readdir(postsDir)).filter((file) => file.endsWith(".md"));
  const posts = await Promise.all(files.map(async (file) => {
    const { frontmatter, body } = splitDocument(await readFile(path.join(postsDir, file), "utf8"));
    const date = String(frontmatter.date ?? "").slice(0, 10);
    const [year, month, day] = date.split("-");
    const slug = path.basename(file, ".md");
    const preview = plainText(body.split("<!--more-->")[0]);
    const sourceUrl = `https://ziyu-xu.github.io/${year}/${month}/${day}/${encodeURIComponent(slug)}/`;
    const renderedBody = resolvePostAssets(body.replace(/<!--more-->/g, ""), sourceUrl);
    return {
      title: frontmatter.title ?? slug,
      date,
      tag: frontmatter.tags ?? "Notes",
      slug,
      excerpt: preview.slice(0, 160),
      html: marked.parse(renderedBody, { gfm: true }),
      sourceUrl,
    };
  }));
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

async function readIntroduction() {
  const { body } = splitDocument(await readFile(path.join(sourceRoot, "about", "index.md"), "utf8"));
  return body.split(/\r?\n\s*\r?\n/).map(plainText).filter(Boolean);
}

async function readHomeIntroduction() {
  const markdown = await readFile(path.join(siteRoot, "content", "home", "introduction.md"), "utf8");
  return marked.parse(markdown, { gfm: true });
}

async function readMusicConfig() {
  return JSON.parse(await readFile(path.join(sourceRoot, "_data", "music.json"), "utf8"));
}

async function readPublications() {
  const { body } = splitDocument(await readFile(path.join(sourceRoot, "about", "publications", "index.md"), "utf8"));
  const blocks = body.split(/\r?\n(?=\d+\.\s+\*\*)/).filter((block) => /^\d+\./.test(block.trim()));
  return blocks.map((block) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const title = lines[0].replace(/^\d+\.\s+\*\*/, "").replace(/\*\*\.?$/, "").trim();
    const authors = (lines[1] ?? "").replace(/\\\*/g, "*").replace(/\*/g, "");
    const venue = (lines[2] ?? "").replace(/\\\*/g, "*").replace(/\*/g, "");
    const link = block.match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/)?.[1] ?? "#";
    const year = venue.match(/\b(20\d{2})\b/)?.[1] ?? "";
    return { title, authors, venue, year, url: link };
  });
}

const posts = await readPosts();
const output = {
  introduction: await readIntroduction(),
  homeIntroductionHtml: await readHomeIntroduction(),
  publications: await readPublications(),
  posts,
  tags: [...new Set(posts.map((post) => post.tag))].sort(),
  music: await readMusicConfig(),
};

const dataDir = path.join(siteRoot, "app", "data");
await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "content.generated.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Synced ${output.publications.length} publications and ${output.posts.length} posts from Hexo.`);
