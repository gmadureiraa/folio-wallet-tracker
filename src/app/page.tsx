"use client";

import { motion } from "framer-motion";
import { FloatingTokens } from "@/components/floating-tokens";
import { WalletIcon } from "@/components/wallet-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "\u26d3",
    title: "8+ Chains",
    subtitle: "One unified view",
    desc: "Ethereum, Solana, Avalanche, Polygon, BNB, Base, Arbitrum and more \u2014 all your wallets in a single dashboard.",
  },
  {
    icon: "\ud83d\udcca",
    title: "Smart DCA",
    subtitle: "Automatic cost basis",
    desc: "Track your dollar-cost averaging strategy automatically with per-asset cost basis and entry price history.",
  },
  {
    icon: "\ud83c\udfaf",
    title: "Allocation Goals",
    subtitle: "Stay on target",
    desc: "Set target allocations and get notified when your portfolio drifts off course. Rebalancing made simple.",
  },
  {
    icon: "\ud83c\udf0a",
    title: "DeFi & Pools",
    subtitle: "Yield in real time",
    desc: "Liquidity positions, staking rewards, and yield farms tracked in real time across every protocol.",
  },
  {
    icon: "\ud83d\udd14",
    title: "Price Alerts",
    subtitle: "Never miss a move",
    desc: "Customizable alerts per asset. Get pinged on mobile the moment thresholds are hit.",
  },
  {
    icon: "\ud83d\udcc8",
    title: "Full PnL",
    subtitle: "Know your numbers",
    desc: "Realized and unrealized gains, per token, per chain \u2014 with beautiful charts and export options.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

function BrowserMockup() {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-zinc-200 shadow-2xl bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-100 border-b border-zinc-200">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-zinc-300" />
          <span className="w-3 h-3 rounded-full bg-zinc-300" />
          <span className="w-3 h-3 rounded-full bg-zinc-300" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-md px-4 py-1 text-xs text-zinc-400 font-mono border border-zinc-200 w-64 text-center">
            app.folio.finance
          </div>
        </div>
      </div>
      {/* Dashboard content */}
      <div className="bg-zinc-950 p-6 md:p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">My Portfolio</p>
              <p className="text-zinc-500 text-xs">3 wallets connected</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-xl tracking-tight">$84,291.40</p>
            <p className="text-emerald-400 text-xs font-semibold">\u2191 +12.4% (30d)</p>
          </div>
        </div>
        {/* Mini chart area */}
        <div className="h-20 mb-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-end px-4 pb-3 gap-[3px] overflow-hidden">
          {[28, 32, 30, 35, 33, 40, 38, 45, 42, 50, 48, 55, 52, 58, 56, 62, 60, 65, 63, 68, 65, 70, 68, 72].map(
            (h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-emerald-500/60"
                style={{ height: `${h}%` }}
              />
            )
          )}
        </div>
        {/* Token rows */}
        <div className="space-y-2">
          {[
            { name: "Bitcoin", symbol: "BTC", pct: "+8.2%", value: "$42,150", color: "#f7931a", alloc: "50%" },
            { name: "Ethereum", symbol: "ETH", pct: "+15.1%", value: "$21,840", color: "#627eea", alloc: "26%" },
            { name: "Solana", symbol: "SOL", pct: "+22.4%", value: "$12,430", color: "#9945ff", alloc: "15%" },
            { name: "Arbitrum", symbol: "ARB", pct: "-3.1%", value: "$4,280", color: "#28a0f0", alloc: "5%" },
          ].map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: token.color }}
                >
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{token.name}</p>
                  <p className="text-zinc-500 text-[10px]">{token.alloc} of portfolio</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-xs font-semibold">{token.value}</p>
                <p
                  className={`text-[10px] font-semibold ${token.pct.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}
                >
                  {token.pct}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black antialiased relative">
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-black text-xl tracking-tighter">folio.</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500 font-medium">
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-black transition-colors">
              Pricing
            </a>
            <a href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              Download
            </a>
          </div>
          <a
            href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer"
            className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            Open App
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-8 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Subtle radial gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(153,69,255,0.04) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge
              variant="outline"
              className="mb-6 text-xs font-semibold rounded-full px-4 py-1 border-zinc-200 text-zinc-500"
            >
              Multi-chain portfolio tracker \u2014 no wallet connection needed
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-black text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] mb-6 text-black"
          >
            All Your Crypto.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 via-zinc-500 to-zinc-800">
              Finally Together.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track wallets across Ethereum, Solana, Base, Arbitrum and more. Real-time prices, DeFi positions, PnL
            tracking \u2014 without connecting your wallet.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex items-center justify-center gap-3"
          >
            <a
              href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer"
              className="bg-black text-white font-semibold px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-colors text-sm"
            >
              Download free
            </a>
            <a
              href="#features"
              className="text-zinc-500 font-medium px-6 py-3.5 rounded-full hover:bg-zinc-50 transition-colors text-sm"
            >
              See how it works \u2192
            </a>
          </motion.div>
        </div>

        {/* BROWSER MOCKUP */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="relative mx-auto mt-16 px-4 w-full max-w-3xl"
        >
          <BrowserMockup />
          {/* Glow behind mockup */}
          <div
            className="absolute -inset-8 -z-10 rounded-3xl opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(99,102,241,0.15), rgba(153,69,255,0.1), transparent 70%)",
            }}
          />
        </motion.div>

        {/* FLOATING TOKENS around mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[30%] pointer-events-none"
          style={{ width: 900, height: 600 }}
        >
          <FloatingTokens />
        </motion.div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="py-12 px-6 border-y border-zinc-100 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(250,250,250,0.5) 0%, transparent 100%)",
          }}
        />
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-zinc-400 text-sm font-semibold relative z-10">
          {["8+ blockchains", "Real-time prices", "100% non-custodial", "Zero fees"].map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-28 px-6 overflow-hidden">
        {/* Gradient bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, #fafafa 0%, #f5f5f5 50%, #fafafa 100%)",
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
            <h2 className="font-black text-5xl md:text-6xl tracking-tighter leading-none">
              Everything in one place.
            </h2>
            <p className="text-zinc-400 text-lg mt-4 max-w-lg mx-auto">
              No more juggling apps. Folio tracks everything so you don&apos;t have to.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i * 0.5}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-zinc-100 hover:border-zinc-200 transition-all hover:shadow-lg rounded-2xl group">
                  <CardContent className="p-6">
                    <span className="text-2xl mb-3 block">{f.icon}</span>
                    <h3 className="font-bold text-lg tracking-tight mb-1">{f.title}</h3>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide mb-2">{f.subtitle}</p>
                    <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-28 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(99,102,241,0.03) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="font-black text-5xl md:text-6xl tracking-tighter leading-none mb-4">Simple pricing.</h2>
            <p className="text-zinc-400 text-lg mb-12">Start free. Upgrade when you need it.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Free */}
            <Card className="border-zinc-200 rounded-2xl text-left">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg">Free</p>
                  <Badge
                    variant="outline"
                    className="text-[10px] rounded-full px-2 py-0 font-semibold border-zinc-200 text-zinc-400"
                  >
                    Forever free
                  </Badge>
                </div>
                <p className="font-black text-4xl tracking-tight mb-4">
                  $0<span className="text-zinc-400 text-base font-normal">/mo</span>
                </p>
                <ul className="space-y-2 text-sm text-zinc-500">
                  {["3 wallets", "5 chains", "24h price alerts", "Basic PnL"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-black font-bold">\u2713</span> {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer"
                  className="mt-6 block w-full text-center border border-zinc-200 font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-zinc-50 transition-colors"
                >
                  Get started
                </a>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-0 bg-zinc-950 rounded-2xl text-left relative overflow-hidden">
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg text-white">Pro</p>
                  <Badge className="bg-emerald-500 text-white text-[10px] rounded-full px-2 py-0 font-semibold border-0">
                    Coming soon
                  </Badge>
                </div>
                <p className="font-black text-4xl tracking-tight text-white mb-4">
                  $9<span className="text-zinc-500 text-base font-normal">/mo</span>
                </p>
                <ul className="space-y-2 text-sm text-zinc-400">
                  {[
                    "Unlimited wallets",
                    "All 8+ chains",
                    "Real-time alerts",
                    "Full PnL + DeFi",
                    "DCA tracking",
                    "Priority support",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">\u2713</span> {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer"
                  className="mt-6 block w-full text-center bg-white text-black font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-zinc-100 transition-colors"
                >
                  Join waitlist
                </a>
              </CardContent>
              {/* Pro card subtle gradient */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: "radial-gradient(ellipse at top right, rgba(16,185,129,0.3), transparent 70%)",
                }}
              />
            </Card>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="download" className="relative py-28 px-6 bg-zinc-950 overflow-hidden">
        {/* CTA gradient accents */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 80%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(153,69,255,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h2 className="font-black text-5xl md:text-7xl tracking-tighter text-white leading-none mb-6">
              Stop switching
              <br />
              between 12 tabs.
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
              Folio brings your entire portfolio into a single, beautiful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#"
                className="bg-white text-black font-bold px-8 py-3.5 rounded-full hover:bg-zinc-100 transition-colors text-sm w-full sm:w-auto"
              >
                Download for iOS
              </a>
              <a
                href="#"
                className="border border-zinc-700 text-white font-semibold px-8 py-3.5 rounded-full hover:border-zinc-500 transition-colors text-sm w-full sm:w-auto"
              >
                Download for Android
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-lg tracking-tighter">folio.</span>
          <p className="text-zinc-400 text-sm">
            \u00a9 2026 Folio. Built by{" "}
            <a href="https://defiverso.com" className="hover:text-black transition-colors underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Defiverso
            </a>
            .
          </p>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              Privacy
            </a>
            <a href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              Terms
            </a>
            <a href="https://wallet-tracker-orcin.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
