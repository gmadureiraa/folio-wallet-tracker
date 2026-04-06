"use client";

import { motion } from "framer-motion";
import {
  Layers,
  BarChart3,
  Target,
  Waves,
  Bell,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "16 Chains",
    desc: "Ethereum, Solana, Avalanche, Polygon, BNB, Base, Arbitrum and more — all your wallets in a single view.",
  },
  {
    icon: BarChart3,
    title: "Smart DCA",
    desc: "Automatic cost basis tracking. Per-asset entry prices and dollar-cost averaging history.",
  },
  {
    icon: Target,
    title: "Allocation Goals",
    desc: "Set target allocations. Get notified when your portfolio drifts. Rebalancing made simple.",
  },
  {
    icon: Waves,
    title: "DeFi & Pools",
    desc: "Liquidity positions, staking rewards, and yield farms tracked in real time across every protocol.",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    desc: "Customizable alerts per asset. Get pinged the moment thresholds are hit.",
  },
  {
    icon: TrendingUp,
    title: "Full PnL",
    desc: "Realized and unrealized gains, per token, per chain — with charts and export options.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function Home() {
  const serif = 'Georgia, "Times New Roman", serif';
  const mono = 'var(--font-geist-mono), ui-monospace, "Courier New", monospace';

  return (
    <div className="min-h-screen bg-white text-black">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="text-xl font-bold"
            style={{ fontFamily: serif }}
          >
            folio.
          </span>
          <div className="hidden md:flex items-center gap-10 text-xs tracking-[0.2em] uppercase text-[#525252]">
            <a
              href="#features"
              className="hover:text-black transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-black transition-colors"
            >
              Pricing
            </a>
            <a
              href="https://wallet-tracker-orcin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Docs
            </a>
          </div>
          <a
            href="https://wallet-tracker-orcin.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white text-xs font-semibold tracking-wide px-5 py-2 rounded-none hover:bg-[#333] transition-colors"
          >
            Open App
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] mb-6 text-black"
            style={{ fontFamily: serif }}
          >
            Your entire portfolio.
            <br />
            One place.
          </h1>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="text-[#525252] text-lg md:text-xl max-w-2xl leading-relaxed mb-8"
          style={{ fontFamily: serif }}
        >
          Track wallets across 16 blockchains. Real-time prices, DeFi
          positions, PnL — without connecting your wallet.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="flex flex-col sm:flex-row items-start gap-4 mb-16"
        >
          <a
            href="https://wallet-tracker-orcin.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white font-semibold px-8 py-3 rounded-none hover:bg-[#333] transition-colors text-sm tracking-wide"
          >
            Open Folio
          </a>
          <a
            href="#features"
            className="text-[#525252] font-medium px-2 py-3 hover:text-black transition-colors text-sm"
          >
            Learn more &darr;
          </a>
        </motion.div>

        {/* Stats strip — monospace */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="border-t border-b border-[#e5e5e5] py-6 flex flex-wrap gap-x-8 gap-y-2"
          style={{ fontFamily: mono }}
        >
          <span className="text-sm text-black">16 chains</span>
          <span className="text-sm text-[#a3a3a3]">|</span>
          <span className="text-sm text-black">17,000+ pools</span>
          <span className="text-sm text-[#a3a3a3]">|</span>
          <span className="text-sm text-black">Real-time data</span>
          <span className="text-sm text-[#a3a3a3]">|</span>
          <span className="text-sm text-black">Non-custodial</span>
        </motion.div>
      </section>

      {/* BROWSER MOCKUP — minimal, paper-style */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border border-[#e5e5e5] bg-white"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e5e5e5]">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-[#d4d4d4]" />
              <span className="w-2.5 h-2.5 rounded-full border border-[#d4d4d4]" />
              <span className="w-2.5 h-2.5 rounded-full border border-[#d4d4d4]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div
                className="border border-[#e5e5e5] px-4 py-1 text-xs text-[#a3a3a3] w-56 text-center"
                style={{ fontFamily: mono }}
              >
                app.folio.finance
              </div>
            </div>
          </div>
          {/* Dashboard content — monochrome */}
          <div className="p-6 md:p-8 bg-[#fafafa]">
            {/* Top row */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-widest mb-1">
                  Portfolio
                </p>
                <p
                  className="text-3xl font-bold tracking-tight text-black"
                  style={{ fontFamily: mono }}
                >
                  $84,291.40
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm text-black"
                  style={{ fontFamily: mono }}
                >
                  +12.4%
                </p>
                <p className="text-xs text-[#a3a3a3]">30d return</p>
              </div>
            </div>
            {/* Chart — minimal bars */}
            <div className="h-16 mb-6 flex items-end gap-[2px]">
              {[28, 32, 30, 35, 33, 40, 38, 45, 42, 50, 48, 55, 52, 58, 56, 62, 60, 65, 63, 68, 65, 70, 68, 72].map(
                (h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-black"
                    style={{ height: `${h}%`, opacity: 0.15 + (i / 24) * 0.85 }}
                  />
                )
              )}
            </div>
            {/* Token rows — table style */}
            <div className="border-t border-[#e5e5e5]">
              {[
                { name: "Bitcoin", symbol: "BTC", pct: "+8.2%", value: "$42,150", alloc: "50.0%" },
                { name: "Ethereum", symbol: "ETH", pct: "+15.1%", value: "$21,840", alloc: "25.9%" },
                { name: "Solana", symbol: "SOL", pct: "+22.4%", value: "$12,430", alloc: "14.7%" },
                { name: "Arbitrum", symbol: "ARB", pct: "-3.1%", value: "$4,280", alloc: "5.1%" },
              ].map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between py-3 border-b border-[#e5e5e5] last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold w-10"
                      style={{ fontFamily: mono }}
                    >
                      {token.symbol}
                    </span>
                    <span className="text-sm text-[#525252]">{token.name}</span>
                  </div>
                  <div
                    className="flex items-center gap-6 text-sm"
                    style={{ fontFamily: mono }}
                  >
                    <span className="text-[#a3a3a3] w-14 text-right">
                      {token.alloc}
                    </span>
                    <span className="w-20 text-right">{token.value}</span>
                    <span
                      className={`w-16 text-right ${
                        token.pct.startsWith("+")
                          ? "text-black"
                          : "text-[#525252]"
                      }`}
                    >
                      {token.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-12 px-6 border-t border-b border-[#e5e5e5]">
        <div
          className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-black"
          style={{ fontFamily: mono }}
        >
          <span>16 blockchains</span>
          <span className="text-[#d4d4d4]">/</span>
          <span>Real-time prices</span>
          <span className="text-[#d4d4d4]">/</span>
          <span>100% non-custodial</span>
          <span className="text-[#d4d4d4]">/</span>
          <span>Zero fees</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
            className="mb-16"
          >
            <p
              className="text-xs tracking-[0.2em] uppercase text-[#a3a3a3] mb-4"
            >
              Features
            </p>
            <h2
              className="text-4xl md:text-5xl font-normal leading-tight"
              style={{ fontFamily: serif }}
            >
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-[#e5e5e5]">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeUp}
                  custom={i * 0.3}
                  className="p-6 border-b border-r border-[#e5e5e5]"
                >
                  <Icon className="w-5 h-5 text-black mb-4" strokeWidth={1.5} />
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: serif }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm text-[#525252] leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 border-t border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-[#a3a3a3] mb-4">
              Pricing
            </p>
            <h2
              className="text-4xl md:text-5xl font-normal leading-tight"
              style={{ fontFamily: serif }}
            >
              Simple pricing.
            </h2>
            <p className="text-[#525252] text-lg mt-3" style={{ fontFamily: serif }}>
              Start free. Upgrade when you need more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-2xl">
            {/* Free tier */}
            <div className="border border-[#e5e5e5] p-6">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wide mb-1">
                  Free
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ fontFamily: mono }}
                >
                  $0
                  <span className="text-[#a3a3a3] text-sm font-normal">
                    /mo
                  </span>
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[#525252] mb-6">
                {["3 wallets", "5 chains", "24h price alerts", "Basic PnL"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-black">&#x2713;</span> {item}
                    </li>
                  )
                )}
              </ul>
              <a
                href="https://wallet-tracker-orcin.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center border border-[#e5e5e5] text-sm font-semibold px-4 py-2.5 rounded-none hover:bg-[#fafafa] transition-colors"
              >
                Get started
              </a>
            </div>

            {/* Pro tier */}
            <div className="border border-[#e5e5e5] border-l-0 p-6 bg-black text-white">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    Pro
                  </p>
                  <span
                    className="text-[10px] border border-[#525252] px-2 py-0.5 uppercase tracking-wider text-[#a3a3a3]"
                  >
                    Coming soon
                  </span>
                </div>
                <p
                  className="text-3xl font-bold"
                  style={{ fontFamily: mono }}
                >
                  $9
                  <span className="text-[#737373] text-sm font-normal">
                    /mo
                  </span>
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[#a3a3a3] mb-6">
                {[
                  "Unlimited wallets",
                  "All 16 chains",
                  "Real-time alerts",
                  "Full PnL + DeFi",
                  "DCA tracking",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-white">&#x2713;</span> {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://wallet-tracker-orcin.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-white text-black text-sm font-semibold px-4 py-2.5 rounded-none hover:bg-[#f5f5f5] transition-colors"
              >
                Join waitlist
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 border-t border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2
              className="text-4xl md:text-6xl font-normal leading-tight mb-6"
              style={{ fontFamily: serif }}
            >
              Stop switching
              <br />
              between 12 tabs.
            </h2>
            <p className="text-[#525252] text-lg mb-8 max-w-lg" style={{ fontFamily: serif }}>
              Your entire portfolio in a single, clean dashboard.
            </p>
            <a
              href="https://wallet-tracker-orcin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black text-white font-semibold px-8 py-3 rounded-none hover:bg-[#333] transition-colors text-sm tracking-wide"
            >
              Open Folio
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e5e5e5] py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-lg font-bold"
            style={{ fontFamily: serif }}
          >
            folio.
          </span>
          <p className="text-[#a3a3a3] text-xs" style={{ fontFamily: mono }}>
            &copy; 2026 Folio. Built by{" "}
            <a
              href="https://defiverso.com"
              className="hover:text-black transition-colors underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Defiverso
            </a>
            . Contact:{" "}
            <a
              href="mailto:gm@kaleidos.agency"
              className="hover:text-black transition-colors underline underline-offset-2"
            >
              gm@kaleidos.agency
            </a>
          </p>
          <div
            className="flex gap-6 text-xs text-[#a3a3a3]"
            style={{ fontFamily: mono }}
          >
            <a
              href="https://wallet-tracker-orcin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Privacy
            </a>
            <a
              href="https://wallet-tracker-orcin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Terms
            </a>
            <a
              href="https://x.com/madureira"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
