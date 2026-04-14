import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2, Wallet } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/blog-data";
import { notFound } from "next/navigation";

/* ── Static Generation ────────────────────────────────────── */

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} — Folio Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

/* ── Simple Markdown-ish to HTML ──────────────────────────── */

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  function flushTable(key: number) {
    if (tableBuffer.length < 2) return null;
    const headerRow = tableBuffer[0];
    const dataRows = tableBuffer.slice(2); // skip separator row
    const headers = headerRow
      .split("|")
      .map((h) => h.trim())
      .filter(Boolean);

    return (
      <div key={key} className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left py-2 px-3 border-b border-gray-200 font-semibold text-gray-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => {
              const cells = row
                .split("|")
                .map((c) => c.trim())
                .filter(Boolean);
              return (
                <tr key={ri}>
                  {cells.map((cell, ci) => (
                    <td
                      key={ci}
                      className="py-2 px-3 border-b border-gray-50 text-gray-600"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith("|")) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      const table = flushTable(i);
      if (table) elements.push(table);
      tableBuffer = [];
      inTable = false;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="font-serif text-lg md:text-xl font-normal mt-8 mb-3 text-gray-900"
        >
          {line.slice(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="font-serif text-xl md:text-2xl font-normal mt-10 mb-4 text-gray-900"
        >
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // List items
    if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <li key={i} className="ml-4 mb-1.5 text-gray-600 leading-relaxed">
            <strong className="text-gray-800">{match[1]}</strong>
            {match[2] ? `: ${match[2]}` : ""}
          </li>
        );
        continue;
      }
    }
    if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 mb-1.5 text-gray-600 leading-relaxed">
          {renderInline(line.slice(2))}
        </li>
      );
      continue;
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s\*\*(.+?)\*\*\s*(.*)/);
    if (numberedMatch) {
      elements.push(
        <li
          key={i}
          className="ml-4 mb-1.5 text-gray-600 leading-relaxed list-decimal"
        >
          <strong className="text-gray-800">{numberedMatch[2]}</strong>{" "}
          {numberedMatch[3]}
        </li>
      );
      continue;
    }
    const numberedPlain = line.match(/^(\d+)\.\s(.*)/);
    if (numberedPlain) {
      elements.push(
        <li
          key={i}
          className="ml-4 mb-1.5 text-gray-600 leading-relaxed list-decimal"
        >
          {renderInline(numberedPlain[2])}
        </li>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="text-gray-600 leading-relaxed mb-4">
        {renderInline(line)}
      </p>
    );
  }

  // Flush remaining table
  if (inTable && tableBuffer.length > 0) {
    const table = flushTable(lines.length);
    if (table) elements.push(table);
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Bold
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-gray-800">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

/* ── Date formatter ───────────────────────────────────────── */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ── Share Buttons (client-side via simple links) ─────────── */

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = `https://folio.app/blog/${slug}`;
  const text = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="flex items-center gap-3 text-gray-400">
      <Share2 className="w-4 h-4" />
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs hover:text-gray-900 transition-colors"
      >
        Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs hover:text-gray-900 transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs hover:text-gray-900 transition-colors"
      >
        Telegram
      </a>
    </div>
  );
}

/* ── Category colors ──────────────────────────────────────── */

const categoryColors: Record<string, string> = {
  guides: "bg-blue-50 text-blue-700",
  security: "bg-red-50 text-red-700",
  defi: "bg-purple-50 text-purple-700",
  news: "bg-amber-50 text-amber-700",
  education: "bg-green-50 text-green-700",
};

/* ── Page Component ───────────────────────────────────────── */

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  // Related posts: same category, excluding current, max 3
  const related = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);
  // If not enough same-category, fill with recent posts
  const finalRelated =
    related.length < 2
      ? [
          ...related,
          ...blogPosts
            .filter(
              (p) =>
                p.slug !== post.slug && !related.find((r) => r.slug === p.slug)
            )
            .slice(0, 2 - related.length),
        ]
      : related;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-900" />
            <span className="font-bold text-lg tracking-tight font-serif">
              Folio
            </span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link
              href="/#features"
              className="hover:text-gray-900 transition-colors hidden md:block"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-gray-900 transition-colors hidden md:block"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-gray-900 font-medium hidden md:block"
            >
              Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <main className="max-w-prose mx-auto px-6 pt-28 pb-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category] || "bg-gray-100 text-gray-700"}`}
          >
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {post.readTime} min read
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {formatDate(post.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight mb-8">
          {post.title}
        </h1>

        {/* Content */}
        <article className="[&>h2]:first:mt-0">{renderContent(post.content)}</article>

        {/* Share */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <ShareButtons title={post.title} slug={post.slug} />
        </div>

        {/* Related Posts */}
        {finalRelated.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-xl mb-6">Related Articles</h3>
            <div className="grid gap-4">
              {finalRelated.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group block p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[rp.category] || "bg-gray-100 text-gray-700"}`}
                    >
                      {rp.category.charAt(0).toUpperCase() +
                        rp.category.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {rp.readTime} min
                    </span>
                  </div>
                  <h4 className="font-serif text-lg group-hover:text-gray-600 transition-colors leading-snug">
                    {rp.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        &copy; 2026 Folio. All rights reserved.
      </footer>
    </div>
  );
}
