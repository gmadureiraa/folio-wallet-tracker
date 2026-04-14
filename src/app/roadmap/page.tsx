"use client";

import { useState } from "react";
import { Wallet, Check, Circle, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   ROADMAP DATA
   ══════════════════════════════════════════════════════════════ */

interface RoadmapItem {
  label: string;
  done: boolean;
}

interface Quarter {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  current: boolean;
  items: RoadmapItem[];
}

const QUARTERS: Quarter[] = [
  {
    id: "q2-2026",
    title: "Q2 2026",
    subtitle: "Foundation",
    period: "April — June",
    current: true,
    items: [
      { label: "Multi-chain scanning (16 chains)", done: true },
      { label: "Real-time portfolio tracking", done: true },
      { label: "Pro payment (crypto on-chain)", done: true },
      { label: "Blog with SEO content", done: true },
      { label: "Basic NFT detection", done: true },
      { label: "Gas tracker", done: true },
      { label: "DeFi yield pools (DeFiLlama)", done: true },
      { label: "Transaction history (real on-chain data)", done: false },
      { label: "Portfolio performance chart (7d/30d/90d/1y)", done: false },
      { label: "Email notifications for price alerts", done: false },
      { label: "Mobile PWA optimization", done: false },
    ],
  },
  {
    id: "q3-2026",
    title: "Q3 2026",
    subtitle: "Growth",
    period: "July — September",
    current: false,
    items: [
      { label: "Whale tracker (real whale monitoring)", done: false },
      { label: "Investment goals tracker", done: false },
      { label: "Portfolio sharing (public link)", done: false },
      { label: "Token discovery (trending by chain)", done: false },
      { label: "Improved NFT viewer (floor prices, rarity)", done: false },
      { label: "Multi-language (PT-BR, ES)", done: false },
      { label: "Referral program ($0.50/referral)", done: false },
    ],
  },
  {
    id: "q4-2026",
    title: "Q4 2026",
    subtitle: "Advanced",
    period: "October — December",
    current: false,
    items: [
      { label: "DCA planner with scheduling", done: false },
      { label: "Smart allocator with backtesting", done: false },
      { label: "Tax report generation (CSV + PDF)", done: false },
      { label: "Telegram bot integration", done: false },
      { label: "API access for Pro users", done: false },
      { label: "Chrome extension", done: false },
    ],
  },
  {
    id: "q1-2027",
    title: "Q1 2027",
    subtitle: "Scale",
    period: "January — March",
    current: false,
    items: [
      { label: "Mobile app (React Native)", done: false },
      { label: "Team / shared portfolios", done: false },
      { label: "Advanced analytics (correlation, risk score)", done: false },
      { label: "Institutional tier", done: false },
      { label: "Bitcoin Lightning support", done: false },
      { label: "Custom chain integration", done: false },
    ],
  },
  {
    id: "q2-2027",
    title: "Q2 2027",
    subtitle: "Platform",
    period: "April — June",
    current: false,
    items: [
      { label: "Social features (follow wallets, leaderboard)", done: false },
      { label: "Content creator tools (embed widget)", done: false },
      { label: "White-label solution", done: false },
      { label: "Fiat on-ramp partnership", done: false },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function QuarterCard({ quarter }: { quarter: Quarter }) {
  const doneCount = quarter.items.filter((i) => i.done).length;
  const totalCount = quarter.items.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="relative">
      {/* Timeline dot + line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100 ml-3 md:ml-4" />
      <div
        className={`absolute left-0 top-1 w-7 h-7 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center z-10 ${
          quarter.current
            ? "border-gray-900 bg-gray-900"
            : "border-gray-200 bg-white"
        }`}
      >
        {quarter.current ? (
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        ) : doneCount === totalCount && totalCount > 0 ? (
          <Check size={12} className="text-gray-400" />
        ) : (
          <Circle size={8} className="text-gray-300" />
        )}
      </div>

      {/* Content */}
      <div className="ml-12 md:ml-16 pb-12">
        {/* Header */}
        <div className="flex items-baseline gap-3 mb-1">
          <h3 className="text-lg md:text-xl font-bold font-serif text-gray-900">
            {quarter.title}
          </h3>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {quarter.subtitle}
          </span>
          {quarter.current && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-900 text-white">
              Now
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">{quarter.period}</p>

        {/* Progress bar */}
        {quarter.current && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-400">
                {doneCount} of {totalCount} shipped
              </span>
              <span className="text-[11px] font-medium text-gray-900">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <ul className="space-y-2">
          {quarter.items.map((item) => (
            <li key={item.label} className="flex items-start gap-2.5">
              {item.done ? (
                <span className="flex-shrink-0 w-5 h-5 rounded-md bg-gray-900 flex items-center justify-center mt-0.5">
                  <Check size={12} className="text-white" strokeWidth={2.5} />
                </span>
              ) : (
                <span className="flex-shrink-0 w-5 h-5 rounded-md border border-gray-200 mt-0.5" />
              )}
              <span
                className={`text-sm ${
                  item.done ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */

export default function RoadmapPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: integrate with email service (Resend, ConvertKit, etc.)
      setSubmitted(true);
    }
  };

  return (
    <main className="bg-white text-gray-900 antialiased min-h-screen">
      {/* ════════════════════════════════════════
          NAV (same as landing)
          ════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Wallet className="w-5 h-5 text-gray-900" />
            <span className="font-bold text-lg tracking-tight font-serif text-gray-900">
              Folio
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link
              href="/#features"
              className="hover:text-gray-900 transition-colors no-underline text-gray-500"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-gray-900 transition-colors no-underline text-gray-500"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="hover:text-gray-900 transition-colors no-underline text-gray-500"
            >
              Blog
            </Link>
            <Link
              href="/roadmap"
              className="text-gray-900 font-medium no-underline"
            >
              Roadmap
            </Link>
          </div>
          <Link
            href="/app"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors no-underline"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO
          ════════════════════════════════════════ */}
      <section className="pt-28 pb-8 md:pt-32 md:pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-serif mb-4">
            Roadmap
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
            What we've shipped, what we're building, and where we're headed.
            Transparent by default.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TIMELINE
          ════════════════════════════════════════ */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          {QUARTERS.map((quarter) => (
            <QuarterCard key={quarter.id} quarter={quarter} />
          ))}

          {/* End of timeline */}
          <div className="relative">
            <div className="absolute left-0 w-px bg-gray-100 ml-3 md:ml-4 h-8" />
            <div className="absolute left-0 top-8 w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-dashed border-gray-200 bg-white flex items-center justify-center">
              <span className="text-[10px] text-gray-300">...</span>
            </div>
            <div className="ml-12 md:ml-16 pt-7">
              <p className="text-sm text-gray-400 italic">
                And beyond. We ship every week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SUBSCRIBE
          ════════════════════════════════════════ */}
      <section className="px-6 pb-24">
        <div className="max-w-md mx-auto text-center">
          <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50">
            <Mail className="w-6 h-6 text-gray-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold font-serif mb-1">
              Get notified when we ship
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              No spam. One email per major release.
            </p>

            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-900">
                <Check size={16} className="text-green-600" />
                <span>You're on the list. We'll be in touch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors bg-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
          ════════════════════════════════════════ */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 text-sm mb-3">
            Don't wait for the roadmap — the core product is live.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors no-underline"
          >
            Start Tracking <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER (same as landing)
          ════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400 font-serif">
              Folio
            </span>
          </div>
          <div className="flex gap-6 text-xs text-gray-400">
            <a
              href="https://x.com/foliotracker"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com/gmadureiraa/folio-wallet-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              GitHub
            </a>
          </div>
          <p className="text-xs text-gray-300">
            &copy; 2026 Folio. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
