"use client";

import { useState } from "react";
import Image from "next/image";

type Category = "all" | "crypto" | "saas" | "marketing";

const PROJECTS = [
  {
    name: "KAI Kreator",
    desc: "SaaS de gestão de conteúdo para criadores. Pipeline, analytics, automações com IA e calendário editorial.",
    img: "/projects/kai-2.png",
    stack: ["React", "TypeScript", "Supabase"],
    category: "saas" as Category,
    url: null,
    date: "2026",
  },
  {
    name: "DeFi Radar",
    desc: "Dashboard cripto com 16 páginas. Preços em tempo real, gas tracker, whale tracker, alertas e análise de tendências.",
    img: "/projects/defi-radar-live.png",
    stack: ["React", "Three.js", "CoinGecko"],
    category: "crypto" as Category,
    url: "https://radar-blond-zeta.vercel.app",
    date: "2026",
  },
  {
    name: "Kaleidos Pay",
    desc: "Gateway de pagamentos para agências. PIX, cartão e cripto. Dashboard com gráficos, cobranças recorrentes.",
    img: "/projects/kaleidos-pay-live.png",
    stack: ["Next.js", "Supabase", "Asaas"],
    category: "saas" as Category,
    url: null,
    date: "2026",
  },
  {
    name: "Stable Vault",
    desc: "Agregador de yield DeFi para stablecoins. 3 estratégias de risco, dados reais via DeFiLlama, rebalanceamento semanal.",
    img: "/projects/aegis-yield-live.png",
    stack: ["Next.js", "DeFiLlama", "Recharts"],
    category: "crypto" as Category,
    url: "https://stable-vault.vercel.app",
    date: "2026",
  },
  {
    name: "Defiverso Hub",
    desc: "Portal educacional de DeFi e Web3. Landing com shaders GLSL, comunidade e conteúdo.",
    img: "/projects/defiverso-hub.png",
    stack: ["Next.js", "Three.js", "GLSL"],
    category: "crypto" as Category,
    url: "https://defiverso-hub.vercel.app",
    date: "2025",
  },
  {
    name: "Rabito",
    desc: "App de hábitos com streak system, mood tracker, analytics e gamificação. Weekly view, categorias.",
    img: "/projects/rabito-live.png",
    stack: ["Next.js", "Zustand", "Recharts"],
    category: "saas" as Category,
    url: null,
    date: "2026",
  },
  {
    name: "Wallet Tracker",
    desc: "Portfolio tracker multi-chain. Escaneia 16 blockchains, preços reais, gráficos históricos, PnL, NFTs.",
    img: "/projects/wallet-tracker-live.png",
    stack: ["React", "CoinGecko", "Three.js"],
    category: "crypto" as Category,
    url: "https://wallet-tracker-orcin.vercel.app",
    date: "2026",
  },
  {
    name: "DePay",
    desc: "Landing page de pagamentos cripto com globe COBE interativo. Aceite PIX, USDT, Bitcoin.",
    img: "/projects/depay.png",
    stack: ["React", "COBE", "Tailwind"],
    category: "crypto" as Category,
    url: "https://depay-rho.vercel.app",
    date: "2025",
  },
  {
    name: "Mentoria Defiverso",
    desc: "Plataforma de mentoria com Supabase. Dashboard do aluno, QR codes, progresso e comunicação.",
    img: "/projects/mentoria-defiverso.png",
    stack: ["React", "Supabase", "QR Code"],
    category: "saas" as Category,
    url: null,
    date: "2026",
  },
  {
    name: "Viral Hunter",
    desc: "Ferramenta de analytics do YouTube. Descobre vídeos virais, analisa thumbnails, sugere temas.",
    img: "/projects/viral-hunter.png",
    stack: ["React", "Supabase", "YouTube API"],
    category: "marketing" as Category,
    url: null,
    date: "2026",
  },
  {
    name: "Jornal Cripto",
    desc: "Portal de análise cripto com 10k visitas/mês. Newsletter, RSS automatizado, curadoria de notícias.",
    img: "/projects/nbs-site-home.png",
    stack: ["React", "Supabase", "RSS"],
    category: "crypto" as Category,
    url: null,
    date: "2026",
  },
];

const STACK = [
  "TypeScript", "React", "Next.js", "Tailwind CSS",
  "Supabase", "Python", "Three.js", "Framer Motion",
];

const FILTERS: { label: string; value: Category }[] = [
  { label: "Todos", value: "all" },
  { label: "Crypto & DeFi", value: "crypto" },
  { label: "SaaS & Apps", value: "saas" },
  { label: "Marketing", value: "marketing" },
];

export default function Home() {
  const [filter, setFilter] = useState<Category>("all");

  const filtered = filter === "all"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === filter);

  return (
    <main>
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[var(--background)]/70 border-b border-[var(--border)]/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">GM</span>
          <div className="flex gap-6">
            <a href="#projetos" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Projetos</a>
            <a href="#sobre" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Sobre</a>
            <a href="https://x.com/madureira" target="_blank" rel="noopener" className="text-xs text-[var(--accent)]">@madureira</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-[80vh] flex items-end pt-14 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--muted)] tracking-widest uppercase mb-6 animate-fade-up">
            Gabriel Madureira
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl animate-fade-up delay-1">
            Construo produtos digitais em{" "}
            <span className="text-[var(--accent)]">cripto</span>,{" "}
            <span className="text-[var(--accent)]">IA</span> e{" "}
            <span className="text-[var(--accent)]">marketing</span>.
          </h1>
          <p className="text-lg text-[var(--muted)] mt-6 max-w-xl leading-relaxed animate-fade-up delay-2">
            Fundador da Kaleidos. 15+ produtos construídos. De dashboards DeFi a
            gateways de pagamento — transformo ideias em software funcional.
          </p>
          <div className="flex gap-4 mt-10 animate-fade-up delay-3">
            <a
              href="#projetos"
              className="px-6 py-3 bg-[var(--accent)] text-[var(--background)] text-sm font-semibold rounded-lg hover:brightness-110 transition-all"
            >
              Ver projetos
            </a>
            <a
              href="https://linkedin.com/in/gabrielmadureira"
              target="_blank"
              rel="noopener"
              className="px-6 py-3 border border-[var(--border)] text-sm font-medium rounded-lg hover:border-[var(--accent)]/40 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-24 md:py-32 border-t border-[var(--border)]/50" id="projetos">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--muted)] tracking-widest uppercase mb-3">
                Portfolio
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Projetos selecionados
              </h2>
            </div>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    filter === f.value
                      ? "bg-[var(--accent)] text-[var(--background)] font-semibold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <div
                key={project.name}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--accent)]/30 transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[var(--background)]">
                  <Image
                    src={project.img}
                    alt={project.name}
                    width={600}
                    height={375}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">{project.name}</h3>
                    <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--muted)]">
                      {project.date}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    {project.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--muted)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener"
                        className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--accent)] hover:underline shrink-0"
                      >
                        Abrir →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 md:py-32 border-t border-[var(--border)]/50" id="sobre">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--muted)] tracking-widest uppercase mb-4">
                Sobre
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                Gabriel Madureira
              </h2>
              <div className="space-y-4 text-sm text-[var(--muted)] leading-relaxed">
                <p>
                  Fundador da <strong className="text-[var(--foreground)]">Kaleidos</strong> — agência
                  de marketing digital especializada em cripto, web3 e fintech.
                  8 clientes ativos, time distribuído, automações com IA.
                </p>
                <p>
                  Criador do <strong className="text-[var(--foreground)]">Defiverso</strong> — portal
                  educacional de DeFi com comunidade ativa. E do <strong className="text-[var(--foreground)]">
                  KAI</strong> — SaaS de gestão de conteúdo para criadores.
                </p>
                <p>
                  Stack favorita: TypeScript, React, Next.js, Tailwind, Supabase,
                  Python. Construo rápido, itero com dados, e não entrego genérico.
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--muted)] tracking-widest uppercase mb-4">
                Stack
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                {STACK.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)] transition-all"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--muted)] tracking-widest uppercase mb-4">
                Números
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { n: "15+", l: "Produtos construídos" },
                  { n: "8", l: "Clientes ativos" },
                  { n: "50k+", l: "Linhas de código" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-2xl font-bold text-[var(--accent)]">{s.n}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)]/50 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-semibold">Gabriel Madureira</span>
          <div className="flex gap-6">
            {[
              { label: "Twitter/X", href: "https://x.com/madureira" },
              { label: "LinkedIn", href: "https://linkedin.com/in/gabrielmadureira" },
              { label: "GitHub", href: "https://github.com/gabrielmadureira" },
              { label: "Kaleidos", href: "https://kaleidos.digital" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)]">© 2026</p>
        </div>
      </footer>
    </main>
  );
}
