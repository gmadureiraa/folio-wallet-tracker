"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import {
  Check,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Wallet,
  MessageSquare,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   I18N
   ══════════════════════════════════════════════════════════════ */

type Lang = "en" | "pt";

const translations = {
  en: {
    navFeatures: "Features",
    navPricing: "Pricing",
    navBlog: "Blog",
    navCta: "Get Started",
    heroTitle: "Track Every Token.\nAcross Every Chain.",
    heroSub: "16 blockchains. Real-time prices. PnL. NFTs. One dashboard. Free.",
    cta: "Start Tracking",
    statsBlockchains: "Blockchains",
    statsTokens: "Tokens tracked",
    statsUptime: "Uptime",
    statsScan: "Full scan",
    whyFolio: "Why Folio",
    featuresTitle: "One wallet tracker to rule them all.",
    featuresDesc:
      "Folio scans 16 blockchains, tracks real-time prices, calculates PnL, and shows your complete portfolio — NFTs included. No more switching between 5 different apps.",
    feat1Title: "16 Blockchains",
    feat1Desc:
      "Ethereum, Solana, BNB Chain, Polygon, Avalanche, Arbitrum, Optimism, Base, and 8 more. One scan, every chain.",
    feat2Title: "Real-time prices",
    feat2Desc:
      "Live price feeds from CoinGecko. See your portfolio value update in real-time, not 15 minutes ago.",
    feat3Title: "Read-only. Always.",
    feat3Desc:
      "Folio never asks for private keys. We scan public addresses only. Your crypto stays exactly where it is.",
    storyP1:
      "Carlos has ETH on MetaMask, SOL on Phantom, BTC on a Ledger, and some USDT on Binance. Every morning he opens 4 apps to check his portfolio. He has no idea what his total balance is.",
    storyQuote:
      "\u201cI just want to see everything in one place. Without connecting my wallets or giving anyone my keys.\u201d",
    storyP2:
      "Folio scans his 4 public addresses. In 30 seconds, Carlos sees: total balance across all chains, PnL per token, NFT collection, and a historical performance chart. Read-only. No keys shared.",
    storyP3:
      "He sets a price alert for ETH at $4,000. The next week, he gets notified. He checks Folio — his portfolio is up 12% since he started tracking. For the first time, he knows exactly where he stands.",
    storyP4: "A week later, Carlos stopped opening 4 apps. He opens one.",
    storyP5:
      "Folio didn\u2019t just aggregate his tokens. It gave him clarity.",
    chainsTitle: "Supported blockchains",
    chainsMore: "+8 more",
    pricingLabel: "Pricing",
    pricingTitle: "Simple, transparent pricing.",
    pricingDesc: "Pay with crypto. Cancel anytime.",
    planFreeName: "Free",
    planFreePrice: "$0",
    planFreePeriod: "forever",
    planFreeFeatures: [
      "3 wallets",
      "Up to $10,000 portfolio",
      "Basic tracking",
      "Real-time prices",
    ],
    planFreeCta: "Start Free",
    planProName: "Pro",
    planProPrice: "$0.99",
    planProPeriod: "/mo",
    planProFeatures: [
      "Unlimited wallets",
      "16 blockchains",
      "PnL tracking",
      "NFT tracking",
      "Price alerts",
      "Full history",
      "Export CSV/PDF",
    ],
    planProCta: "Pay with Crypto \u2014 $0.99/mo",
    planProBadge: "Most popular",
    planCustomName: "Custom",
    planCustomLabel: "Contact us",
    planCustomFeatures: [
      "Everything in Pro",
      "API access",
      "White-label",
      "Dedicated support",
      "Custom chains",
      "Unlimited everything",
    ],
    planCustomCta: "Talk to us",
    accepted: "Accepted:",
    payWith: "Pay with BTC, ETH, USDT or SOL",
    ctaTitle: "Stop guessing. Start tracking.",
    ctaDesc: "Track everything you own across every chain.",
    ctaButton: "Get Folio Free",
    footerCopy: "\u00a9 2026 Folio. All rights reserved.",
  },
  pt: {
    navFeatures: "Funcionalidades",
    navPricing: "Pre\u00e7os",
    navBlog: "Blog",
    navCta: "Comece Agora",
    heroTitle: "Rastreie Cada Token.\nEm Cada Blockchain.",
    heroSub: "16 blockchains. Pre\u00e7os em tempo real. PnL. NFTs. Um painel. Gr\u00e1tis.",
    cta: "Come\u00e7ar a Rastrear",
    statsBlockchains: "Blockchains",
    statsTokens: "Tokens rastreados",
    statsUptime: "Uptime",
    statsScan: "Scan completo",
    whyFolio: "Por que Folio",
    featuresTitle: "Um rastreador de carteiras para dominar todos.",
    featuresDesc:
      "O Folio escaneia 16 blockchains, rastreia pre\u00e7os em tempo real, calcula PnL e mostra seu portf\u00f3lio completo \u2014 incluindo NFTs. Chega de alternar entre 5 apps diferentes.",
    feat1Title: "16 Blockchains",
    feat1Desc:
      "Ethereum, Solana, BNB Chain, Polygon, Avalanche, Arbitrum, Optimism, Base e mais 8. Um scan, todas as chains.",
    feat2Title: "Pre\u00e7os em tempo real",
    feat2Desc:
      "Feeds de pre\u00e7o ao vivo do CoinGecko. Veja o valor do seu portf\u00f3lio atualizar em tempo real, n\u00e3o de 15 minutos atr\u00e1s.",
    feat3Title: "Somente leitura. Sempre.",
    feat3Desc:
      "O Folio nunca pede suas chaves privadas. Escaneamos apenas endere\u00e7os p\u00fablicos. Suas criptos ficam exatamente onde est\u00e3o.",
    storyP1:
      "Carlos tem ETH no MetaMask, SOL no Phantom, BTC em uma Ledger e USDT na Binance. Toda manh\u00e3 ele abre 4 apps para checar seu portf\u00f3lio. Ele n\u00e3o faz ideia do seu saldo total.",
    storyQuote:
      "\u201cEu s\u00f3 quero ver tudo em um lugar. Sem conectar minhas carteiras ou dar minhas chaves pra ningu\u00e9m.\u201d",
    storyP2:
      "O Folio escaneia seus 4 endere\u00e7os p\u00fablicos. Em 30 segundos, Carlos v\u00ea: saldo total em todas as chains, PnL por token, cole\u00e7\u00e3o de NFTs e gr\u00e1fico de performance hist\u00f3rica. Somente leitura. Sem chaves compartilhadas.",
    storyP3:
      "Ele configura um alerta de pre\u00e7o para ETH a $4.000. Na semana seguinte, recebe a notifica\u00e7\u00e3o. Ele abre o Folio \u2014 seu portf\u00f3lio subiu 12% desde que come\u00e7ou a rastrear. Pela primeira vez, ele sabe exatamente onde est\u00e1.",
    storyP4:
      "Uma semana depois, Carlos parou de abrir 4 apps. Ele abre um s\u00f3.",
    storyP5:
      "O Folio n\u00e3o apenas agregou seus tokens. Ele trouxe clareza.",
    chainsTitle: "Blockchains suportadas",
    chainsMore: "+8 mais",
    pricingLabel: "Pre\u00e7os",
    pricingTitle: "Pre\u00e7os simples e transparentes.",
    pricingDesc: "Pague com cripto. Cancele quando quiser.",
    planFreeName: "Gratuito",
    planFreePrice: "$0",
    planFreePeriod: "para sempre",
    planFreeFeatures: [
      "3 carteiras",
      "At\u00e9 $10.000 em portf\u00f3lio",
      "Rastreamento b\u00e1sico",
      "Pre\u00e7os em tempo real",
    ],
    planFreeCta: "Come\u00e7ar Gr\u00e1tis",
    planProName: "Pro",
    planProPrice: "$0.99",
    planProPeriod: "/m\u00eas",
    planProFeatures: [
      "Carteiras ilimitadas",
      "16 blockchains",
      "Rastreamento PnL",
      "Rastreamento de NFTs",
      "Alertas de pre\u00e7o",
      "Hist\u00f3rico completo",
      "Exportar CSV/PDF",
    ],
    planProCta: "Pagar com Cripto \u2014 $0.99/m\u00eas",
    planProBadge: "Mais popular",
    planCustomName: "Custom",
    planCustomLabel: "Fale conosco",
    planCustomFeatures: [
      "Tudo do Pro",
      "Acesso \u00e0 API",
      "White-label",
      "Suporte dedicado",
      "Chains customizadas",
      "Tudo ilimitado",
    ],
    planCustomCta: "Fale conosco",
    accepted: "Aceitos:",
    payWith: "Pague com BTC, ETH, USDT ou SOL",
    ctaTitle: "Pare de adivinhar. Comece a rastrear.",
    ctaDesc: "Rastreie tudo que voc\u00ea possui em todas as chains.",
    ctaButton: "Comece Gr\u00e1tis",
    footerCopy: "\u00a9 2026 Folio. Todos os direitos reservados.",
  },
} as const;

/* ══════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════ */

/* Token order: USDT and BNB at the FAR edges (positions 0 and 7) so they don't overlap the button */
const TOKENS = [
  { name: "USDT", symbol: "USDT", icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png", color: "#26A17B" },
  { name: "Solana", symbol: "SOL", icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png", color: "#9945FF" },
  { name: "Bitcoin", symbol: "BTC", icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", color: "#F7931A" },
  { name: "Ethereum", symbol: "ETH", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", color: "#627EEA" },
  { name: "Avalanche", symbol: "AVAX", icon: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png", color: "#E84142" },
  { name: "Cardano", symbol: "ADA", icon: "https://assets.coingecko.com/coins/images/975/small/cardano.png", color: "#0033AD" },
  { name: "Polygon", symbol: "MATIC", icon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png", color: "#8247E5" },
  { name: "BNB", symbol: "BNB", icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", color: "#F3BA2F" },
];

/* Token start positions — spread WIDE around wallet, well below the button.
   Values are % relative to wallet container. top:0% = top of wallet image. */
const TOKEN_STARTS: { left: number; top: number }[] = [
  { left: -22, top: 30 },    // USDT — far left, mid
  { left: -10, top: 5 },     // SOL — left, upper
  { left: 10, top: -15 },    // BTC — upper left
  { left: 32, top: -22 },    // ETH — top center-left
  { left: 62, top: -22 },    // AVAX — top center-right
  { left: 83, top: -15 },    // ADA — upper right
  { left: 102, top: 5 },     // MATIC — right, upper
  { left: 114, top: 30 },    // BNB — far right, mid
];

/* Each token has unique rotation, speed offset for stagger */
const TOKEN_ROTATIONS = [-20, -14, -8, 3, -3, 10, 16, 22];
const TOKEN_SPEED = [0.70, 0.76, 0.80, 0.84, 0.88, 0.82, 0.78, 0.72];

/* ══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FLOATING TOKEN — scroll-driven animation
   ══════════════════════════════════════════════════════════════ */

function FloatingToken({
  token,
  index,
  tokenProgress,
}: {
  token: (typeof TOKENS)[number];
  index: number;
  tokenProgress: MotionValue<number>;
}) {
  const startLeft = TOKEN_STARTS[index].left;
  const startTop = TOKEN_STARTS[index].top;
  const rot = TOKEN_ROTATIONS[index];
  const speed = TOKEN_SPEED[index];

  /* Wallet opening = center of wallet dark opening (facing UP) */
  const endLeft = 50;
  const endTop = 45;

  /* Each token reaches the wallet at a slightly different time */
  const personalProgress = useTransform(tokenProgress, (v) =>
    Math.min(Math.max(v / speed, 0), 1)
  );

  /* Animate from spread positions into the wallet center opening */
  const left = useTransform(personalProgress, [0, 1], [startLeft, endLeft]);
  const top = useTransform(personalProgress, [0, 1], [startTop, endTop]);
  const scale = useTransform(personalProgress, [0, 0.6, 1], [1, 0.65, 0.35]);
  const opacity = useTransform(personalProgress, [0, 0.85, 1], [1, 1, 0]);
  const rotate = useTransform(personalProgress, [0, 1], [rot, 0]);

  /* Spring physics for organic feel */
  const springLeft = useSpring(left, { stiffness: 55, damping: 16 });
  const springTop = useSpring(top, { stiffness: 55, damping: 16 });
  const springRotate = useSpring(rotate, { stiffness: 70, damping: 18 });

  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: useTransform(springLeft, (v) => v + "%"),
        top: useTransform(springTop, (v) => v + "%"),
        x: "-50%",
        y: "-50%",
        scale,
        opacity,
        rotate: springRotate,
      }}
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center">
        <img
          src={token.icon}
          alt={token.name}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full"
        />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */

export default function FolioV2() {
  /* ── Language ── */
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang === "pt" || urlLang === "en") {
      setLang(urlLang);
    }
  }, []);

  const t = translations[lang];

  const toggleLang = useCallback(() => {
    const next = lang === "en" ? "pt" : "en";
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url.toString());
  }, [lang]);

  /* ── Hero scroll-lock animation ── */
  const heroRef = useRef<HTMLDivElement>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [scrollFuel, setScrollFuel] = useState(0);

  /* Capture wheel events — BIDIRECTIONAL: scroll down = animate, scroll up = reverse */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // At top of page and animation not complete: capture scroll for animation
      if (window.scrollY < 10 && !animationDone) {
        e.preventDefault();
        setScrollFuel((prev) => {
          const next = Math.min(Math.max(prev + e.deltaY * 0.0012, 0), 1);
          if (next >= 0.95) setAnimationDone(true);
          return next;
        });
      }
      // Scrolled back to top after animation: reverse on scroll up
      if (window.scrollY < 5 && animationDone && e.deltaY < 0) {
        e.preventDefault();
        setAnimationDone(false);
        setScrollFuel(0.85);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [animationDone]);

  /* Touch support — bidirectional */
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const delta = touchStartY - e.touches[0].clientY;
      if (window.scrollY < 10 && !animationDone) {
        e.preventDefault();
        setScrollFuel((prev) => {
          const next = Math.min(Math.max(prev + delta * 0.003, 0), 1);
          if (next >= 0.95) setAnimationDone(true);
          return next;
        });
      }
      if (window.scrollY < 5 && animationDone && delta < -10) {
        e.preventDefault();
        setAnimationDone(false);
        setScrollFuel(0.85);
      }
      touchStartY = e.touches[0].clientY;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [animationDone]);

  /* Convert scrollFuel to spring MotionValue for tokens */
  const scrollFuelMV = useMotionValue(0);
  useEffect(() => {
    scrollFuelMV.set(scrollFuel);
  }, [scrollFuel, scrollFuelMV]);
  const tokenProgress = useSpring(scrollFuelMV, { stiffness: 80, damping: 20 });
  const walletScale = useTransform(tokenProgress, [0, 0.8], [1, 1.03]);

  /* Auto-scroll to next section after animation completes */
  useEffect(() => {
    if (animationDone && heroRef.current) {
      setTimeout(() => {
        heroRef.current?.nextElementSibling?.scrollIntoView({
          behavior: "smooth",
        });
      }, 300);
    }
  }, [animationDone]);

  return (
    <main
      className="bg-white text-gray-900 antialiased overflow-x-hidden"
      suppressHydrationWarning
    >
      {/* ════════════════════════════════════════
          NAV
          ════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-900" />
            <span className="font-bold text-lg tracking-tight font-serif">
              Folio
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a
              href="#features"
              className="hover:text-gray-900 transition-colors"
            >
              {t.navFeatures}
            </a>
            <a
              href="#pricing"
              className="hover:text-gray-900 transition-colors"
            >
              {t.navPricing}
            </a>
            <a
              href="/blog"
              className="hover:text-gray-900 transition-colors"
            >
              {t.navBlog}
            </a>
            <span className="w-px h-4 bg-gray-200" />
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-xs cursor-pointer"
            >
              <span
                className={
                  lang === "en"
                    ? "text-gray-900 font-medium"
                    : "text-gray-400 hover:text-gray-900 transition-colors"
                }
              >
                EN
              </span>
              <span className="text-gray-300">/</span>
              <span
                className={
                  lang === "pt"
                    ? "text-gray-900 font-medium"
                    : "text-gray-400 hover:text-gray-900 transition-colors"
                }
              >
                PT
              </span>
            </button>
          </div>
          <a
            href="/app"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            {t.navCta}
          </a>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO — scroll-locked until animation completes
          ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center pt-24 md:pt-28 pb-12"
      >
        {/* Title block — compact at top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-2 px-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] font-serif whitespace-pre-line">
            {t.heroTitle}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-gray-500 text-base md:text-lg mb-5 px-6 text-center"
        >
          {t.heroSub}
        </motion.p>

        <motion.a
          href="/app"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-30 inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors mb-12 md:mb-16"
        >
          {t.cta}
        </motion.a>

        {/* Wallet + Floating Tokens — takes remaining space, BIGGER wallet */}
        <div className="relative w-full max-w-lg mx-auto flex-1 flex items-start justify-center">
          <motion.div style={{ scale: walletScale }} className="relative w-full">
            {/* Token layer */}
            <div
              className="absolute inset-0 z-10 overflow-visible"
              style={{ pointerEvents: "none" }}
            >
              {TOKENS.map((token, i) => (
                <FloatingToken
                  key={token.symbol}
                  token={token}
                  index={i}
                  tokenProgress={tokenProgress}
                />
              ))}
            </div>

            {/* Wallet image — BIGGER, less padding */}
            <div className="px-4 md:px-8">
              <motion.img
                src="/wallet-v5.png"
                alt="Folio wallet"
                className="relative z-0 w-full h-auto mx-auto"
                animate={
                  animationDone
                    ? { scale: [1, 1.04, 1], transition: { duration: 0.5 } }
                    : {}
                }
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS BAR
          ════════════════════════════════════════ */}
      <section className="py-16 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 16, suffix: "", label: t.statsBlockchains },
            { value: 5000, suffix: "+", label: t.statsTokens },
            { value: 99, suffix: ".9%", label: t.statsUptime },
            { value: 30, suffix: "s", label: t.statsScan },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold tracking-tight font-serif">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SOCIAL PROOF
          ════════════════════════════════════════ */}
      <div className="py-8 text-center">
        <p className="text-sm text-gray-400">
          {lang === "pt"
            ? "Usado por holders de cripto rastreando portfolios em 16 blockchains"
            : "Trusted by crypto holders tracking portfolios across 16 chains"}
        </p>
      </div>

      {/* ════════════════════════════════════════
          FEATURES
          ════════════════════════════════════════ */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">
              {t.whyFolio}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 max-w-2xl font-serif">
              {t.featuresTitle}
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-xl mb-16">
              {t.featuresDesc}
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-5 h-5" />,
                title: t.feat1Title,
                desc: t.feat1Desc,
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: t.feat2Title,
                desc: t.feat2Desc,
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: t.feat3Title,
                desc: t.feat3Desc,
              },
            ].map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.1}>
                <div className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4 text-gray-700">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2 font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          USE CASE STORY
          ════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-2xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
            </div>
          </FadeIn>

          <div className="space-y-8">
            <FadeIn delay={0.1}>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t.storyP1}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {t.storyQuote}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-gray-600 leading-relaxed">{t.storyP2}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-gray-600 leading-relaxed">{t.storyP3}</p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="text-gray-500 leading-relaxed italic">
                {t.storyP4}
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <p className="text-gray-400 text-sm">{t.storyP5}</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SUPPORTED CHAINS
          ════════════════════════════════════════ */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-8">
              {t.chainsTitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex flex-wrap justify-center gap-4">
              {TOKENS.map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 text-sm text-gray-600 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <img
                    src={token.icon}
                    alt={token.name}
                    className="w-5 h-5 rounded-full"
                  />
                  {token.name}
                </div>
              ))}
              <div className="flex items-center px-4 py-2 rounded-full border border-gray-100 text-sm text-gray-400">
                {t.chainsMore}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING
          ════════════════════════════════════════ */}
      <section id="pricing" className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">
                {t.pricingLabel}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-serif">
                {t.pricingTitle}
              </h2>
              <p className="text-gray-500">{t.pricingDesc}</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <FadeIn delay={0}>
              <div className="relative p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                <h3 className="text-lg font-semibold mb-2 font-serif">
                  {t.planFreeName}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold tracking-tight font-serif">
                    {t.planFreePrice}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {t.planFreePeriod}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.planFreeFeatures.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-gray-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/app" className="block w-full py-3 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-center">
                  {t.planFreeCta}
                </a>
              </div>
            </FadeIn>

            {/* Pro Plan */}
            <FadeIn delay={0.1}>
              <div className="relative p-8 rounded-2xl border border-gray-900 shadow-lg scale-[1.02] transition-all">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium bg-gray-900 text-white px-3 py-1 rounded-full">
                  {t.planProBadge}
                </span>
                <h3 className="text-lg font-semibold mb-2 font-serif">
                  {t.planProName}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold tracking-tight font-serif">
                    {t.planProPrice}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {t.planProPeriod}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.planProFeatures.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-gray-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/app" className="block w-full py-3 rounded-full text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all text-center">
                  {t.planProCta}
                </a>
                <p className="text-xs text-gray-400 text-center mt-3">
                  {t.payWith}
                </p>
              </div>
            </FadeIn>

            {/* Custom Plan */}
            <FadeIn delay={0.2}>
              <div className="relative p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                <h3 className="text-lg font-semibold mb-2 font-serif">
                  {t.planCustomName}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-bold tracking-tight text-gray-400">
                    {t.planCustomLabel}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.planCustomFeatures.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-gray-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:contato@folio.app" className="block w-full py-3 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-center">
                  {t.planCustomCta}
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Crypto payment badges */}
          <FadeIn delay={0.3}>
            <div className="flex items-center justify-center gap-4 mt-12">
              <p className="text-xs text-gray-400">{t.accepted}</p>
              {["BTC", "ETH", "USDT", "SOL"].map((symbol) => {
                const token = TOKENS.find((tk) => tk.symbol === symbol);
                return token ? (
                  <div
                    key={symbol}
                    className="flex items-center gap-1.5 text-xs text-gray-500"
                  >
                    <img
                      src={token.icon}
                      alt={symbol}
                      className="w-4 h-4 rounded-full"
                    />
                    {symbol}
                  </div>
                ) : null;
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA — wide Creation of Adam background
          ════════════════════════════════════════ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Full-width background image at low opacity */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/cta-creation-wide.png"
            alt=""
            className="w-full h-auto opacity-[0.10] object-cover"
          />
        </div>

        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 font-serif">
              {t.ctaTitle}
            </h2>
            <p className="text-gray-500 text-lg mb-8">{t.ctaDesc}</p>
            <a
              href="/app"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              {t.ctaButton}
              <ArrowRight className="w-4 h-4" />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
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
            <a href="https://x.com/foliotracker" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              Twitter
            </a>
            <a href="https://github.com/gmadureiraa/folio-wallet-tracker" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              GitHub
            </a>
          </div>
          <p className="text-xs text-gray-300">{t.footerCopy}</p>
        </div>
      </footer>
    </main>
  );
}
