"use client";

import { useState } from "react";
import { ArrowRight, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import "../../components/tracker/tracker.css";
import TrackerApp from "../../components/tracker/App";

/* ═══════════════════════════════════════════
   Loading skeleton
   ═══════════════════════════════════════════ */

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(98,126,234,0.2) 0%, rgba(153,69,255,0.2) 100%)",
              border: "1px solid rgba(98,126,234,0.3)",
            }}
          >
            <Wallet size={18} style={{ color: "#627EEA" }} />
          </div>
          <span className="text-2xl font-bold tracking-tight font-serif text-gray-900">
            Folio
          </span>
        </div>
        <Loader2 size={20} className="animate-spin text-gray-300" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Welcome Gate
   ═══════════════════════════════════════════ */

function WelcomeGate({
  onEnter,
}: {
  onEnter: (address: string) => void;
}) {
  const [address, setAddress] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (trimmed) onEnter(trimmed);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle stipple background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #e5e5e5 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* Wallet stipple illustration */}
        <div className="relative w-40 h-40 mb-8 opacity-90">
          <Image
            src="/wallet-v5.png"
            alt="Folio wallet illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(98,126,234,0.2) 0%, rgba(153,69,255,0.2) 100%)",
              border: "1px solid rgba(98,126,234,0.3)",
            }}
          >
            <Wallet size={18} style={{ color: "#627EEA" }} />
          </div>
          <span className="text-2xl font-bold tracking-tight font-serif text-gray-900">
            Folio
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-center font-serif text-gray-900 mb-2">
          Welcome to Folio
        </h1>
        <p className="text-sm text-gray-400 text-center mb-10 max-w-xs">
          Track every token across every chain. Real-time portfolio tracking with no keys required.
        </p>

        {/* Two paths */}
        <div className="w-full space-y-3">
          {/* Sign in */}
          <Link
            href="/app/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium transition-colors hover:bg-gray-800 no-underline"
          >
            Sign in
            <ArrowRight size={14} />
          </Link>

          {/* Track without account */}
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white transition-colors hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
            >
              Track a wallet without account
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Wallet
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="text"
                    placeholder="0x... or ENS name"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!address.trim()}
                  className="px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium transition-colors hover:bg-gray-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  Track
                </button>
              </div>
              <p className="text-[11px] text-gray-300 text-center">
                Read-only. We never ask for private keys.
              </p>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-8 w-full">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] text-gray-300 uppercase tracking-wider">
            Free features included
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Feature highlights */}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {["16 blockchains", "Real-time prices", "NFTs", "Portfolio view"].map(
            (feat) => (
              <span
                key={feat}
                className="px-3 py-1 rounded-full text-[11px] text-gray-500 border border-gray-100 bg-gray-50/50"
              >
                {feat}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main App Page
   ═══════════════════════════════════════════ */

export default function AppPage() {
  const { user, loading } = useAuth();
  const [guestAddress, setGuestAddress] = useState("");
  const [showTracker, setShowTracker] = useState(false);

  // Loading state
  if (loading) return <LoadingSkeleton />;

  // Authenticated user or guest who entered an address
  if (user || showTracker) {
    return <TrackerApp initialAddress={guestAddress || undefined} />;
  }

  // Welcome gate
  return (
    <WelcomeGate
      onEnter={(address) => {
        setGuestAddress(address);
        setShowTracker(true);
      }}
    />
  );
}
