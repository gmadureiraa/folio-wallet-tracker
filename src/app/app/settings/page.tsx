"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Wallet,
  Settings,
  Trash2,
  Download,
  Sun,
  Moon,
  Globe,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

/* ────────────────────────────────────────── */
/*  Types                                     */
/* ────────────────────────────────────────── */

interface TrackedWallet {
  id: string;
  address: string;
  label: string;
  chain: string;
}

/* ────────────────────────────────────────── */
/*  Component                                 */
/* ────────────────────────────────────────── */

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [wallets, setWallets] = useState<TrackedWallet[]>([]);
  const [lang, setLang] = useState<"en" | "pt">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("folio_email") || "";
    const storedWallet = localStorage.getItem("folio_wallet_address") || "";
    const storedWallets = localStorage.getItem("folio_wallets");
    const storedLang = localStorage.getItem("folio_lang") as "en" | "pt";
    const storedTheme = localStorage.getItem("folio_theme") as "light" | "dark";

    setEmail(storedEmail);
    setWalletAddress(storedWallet);
    if (storedWallets) {
      try { setWallets(JSON.parse(storedWallets)); } catch { /* ignore */ }
    }
    if (storedLang === "en" || storedLang === "pt") setLang(storedLang);
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
  }, []);

  // Save preferences
  const saveLang = (l: "en" | "pt") => {
    setLang(l);
    localStorage.setItem("folio_lang", l);
  };

  const saveTheme = (t: "light" | "dark") => {
    setTheme(t);
    localStorage.setItem("folio_theme", t);
  };

  const removeWallet = (id: string) => {
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    localStorage.setItem("folio_wallets", JSON.stringify(updated));
  };

  const handleExport = () => {
    const data = {
      email,
      walletAddress,
      wallets,
      lang,
      theme,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `folio-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem("folio_email");
    localStorage.removeItem("folio_wallet_address");
    localStorage.removeItem("folio_wallets");
    localStorage.removeItem("folio_lang");
    localStorage.removeItem("folio_theme");
    window.location.href = "/";
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  /* ── Styles ── */
  const cardClass = "rounded-2xl border border-gray-200 bg-white p-6";
  const labelClass = "text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4";
  const btnSecondary =
    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white transition-colors hover:bg-gray-50 hover:border-gray-300 cursor-pointer";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to app
        </Link>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(98,126,234,0.2) 0%, rgba(153,69,255,0.2) 100%)",
              border: "1px solid rgba(98,126,234,0.3)",
            }}
          >
            <Settings size={16} style={{ color: "#627EEA" }} />
          </div>
          <span className="text-xl font-bold tracking-tight font-serif text-gray-900">
            Settings
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        {/* ── Profile ── */}
        <div className={cardClass}>
          <p className={labelClass}>Profile</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  localStorage.setItem("folio_email", e.target.value);
                }}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Wallet address</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    localStorage.setItem("folio_wallet_address", e.target.value);
                  }}
                  placeholder="0x..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 font-mono placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors bg-white"
                />
                {walletAddress && (
                  <button
                    onClick={() => handleCopy(walletAddress, "wallet")}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    title="Copy address"
                  >
                    {copied === "wallet" ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} className="text-gray-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Subscription ── */}
        <div className={cardClass}>
          <p className={labelClass}>Subscription</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Free Plan</p>
              <p className="text-xs text-gray-400 mt-0.5">1 wallet, basic tracking</p>
            </div>
            <Link
              href="/app/plan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors no-underline"
              style={{
                background: "linear-gradient(135deg, rgba(98,126,234,0.08) 0%, rgba(153,69,255,0.08) 100%)",
                color: "#627EEA",
                border: "1px solid rgba(98,126,234,0.15)",
              }}
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>

        {/* ── Tracked wallets ── */}
        <div className={cardClass}>
          <p className={labelClass}>Tracked wallets</p>
          {wallets.length === 0 ? (
            <div className="text-center py-6">
              <Wallet size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No wallets tracked yet</p>
              <Link
                href="/app"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors mt-1 inline-block"
              >
                Add a wallet in the app →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {w.label || "Unnamed"}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {w.address}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex-shrink-0">
                    {w.chain}
                  </span>
                  <button
                    onClick={() => removeWallet(w.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
                    title="Remove wallet"
                  >
                    <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Preferences ── */}
        <div className={cardClass}>
          <p className={labelClass}>Preferences</p>
          <div className="space-y-5">
            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe size={15} className="text-gray-400" />
                <span className="text-sm text-gray-700">Language</span>
              </div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => saveLang("en")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    lang === "en"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => saveLang("pt")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    lang === "pt"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  PT
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {theme === "light" ? (
                  <Sun size={15} className="text-gray-400" />
                ) : (
                  <Moon size={15} className="text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Theme</span>
              </div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => saveTheme("light")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    theme === "light"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Sun size={11} />
                  Light
                </button>
                <button
                  onClick={() => saveTheme("dark")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    theme === "dark"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Moon size={11} />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Data ── */}
        <div className={cardClass}>
          <p className={labelClass}>Data</p>
          <div className="space-y-3">
            <button onClick={handleExport} className={`${btnSecondary} w-full`}>
              <Download size={14} />
              Export portfolio data (JSON)
            </button>
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div className="rounded-2xl border border-red-100 bg-white p-6">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">
            Danger zone
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-500 bg-white transition-colors hover:bg-red-50 hover:border-red-300 cursor-pointer"
            >
              <Trash2 size={14} />
              Delete account and all data
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">
                  This will permanently delete all your data, tracked wallets, and preferences. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`${btnSecondary} flex-1`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium transition-colors hover:bg-red-600 cursor-pointer"
                >
                  <Trash2 size={14} />
                  Yes, delete everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
