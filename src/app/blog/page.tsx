"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { blogPosts, categories, type BlogPost } from "@/lib/blog-data";

const categoryColors: Record<BlogPost["category"], string> = {
  guides: "bg-blue-50 text-blue-700",
  security: "bg-red-50 text-red-700",
  defi: "bg-purple-50 text-purple-700",
  news: "bg-amber-50 text-amber-700",
  education: "bg-green-50 text-green-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<
    BlogPost["category"] | undefined
  >(undefined);

  const filtered = activeCategory
    ? blogPosts.filter((p) => p.category === activeCategory)
    : blogPosts;

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

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Folio
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-4">
            Blog
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Guides, strategies, and insights for tracking your crypto portfolio
            across every chain.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
              >
                {/* Category + Read time */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category]}`}
                  >
                    {post.category.charAt(0).toUpperCase() +
                      post.category.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {post.readTime} min read
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-serif text-xl md:text-2xl tracking-tight mb-2 group-hover:text-gray-700 transition-colors leading-tight">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.publishedAt)}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        &copy; 2026 Folio. All rights reserved.
      </footer>
    </div>
  );
}
