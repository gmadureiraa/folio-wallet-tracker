"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Wallet,
  Sparkles,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/plan-guard";

/* ────────────────────────────────────────── */
/*  Types & constants                         */
/* ────────────────────────────────────────── */

type Step =
  | "select-plan"
  | "select-token"
  | "select-network"
  | "show-details"
  | "verify"
  | "success";

type PlanChoice = "monthly" | "yearly";
type Token = "USDT" | "USDC";
type Network = "ethereum" | "polygon" | "arbitrum" | "bsc" | "base";

const PLAN_PRICES: Record<PlanChoice, { amount: string; label: string; save?: string }> = {
  monthly: { amount: "0.99", label: "$0.99 / month" },
  yearly: { amount: "9.99", label: "$9.99 / year", save: "Save 17%" },
};

const TOKEN_ICONS: Record<Token, { color: string; bg: string; icon: string }> = {
  USDT: { color: "#26A17B", bg: "rgba(38,161,123,0.1)", icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  USDC: { color: "#2775CA", bg: "rgba(39,117,202,0.1)", icon: "https://assets.coingecko.com/coins/images/6319/small/usdc.png" },
};

const CHAIN_ICONS: Record<Network, { color: string; bg: string }> = {
  ethereum: { color: "#627EEA", bg: "rgba(98,126,234,0.1)" },
  polygon: { color: "#8247E5", bg: "rgba(130,71,229,0.1)" },
  arbitrum: { color: "#28A0F0", bg: "rgba(40,160,240,0.1)" },
  bsc: { color: "#F3BA2F", bg: "rgba(243,186,47,0.1)" },
  base: { color: "#0052FF", bg: "rgba(0,82,255,0.1)" },
};

const NETWORKS: { id: Network; name: string; token_usdt?: string; token_usdc?: string }[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    token_usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    token_usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    id: "polygon",
    name: "Polygon",
    token_usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    token_usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    token_usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    token_usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  {
    id: "bsc",
    name: "BNB Chain",
    token_usdt: "0x55d398326f99059fF775485246999027B3197955",
    token_usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
  {
    id: "base",
    name: "Base",
    token_usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
];

const PAYMENT_WALLET =
  process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
  "0x0000000000000000000000000000000000000000";

/* ────────────────────────────────────────── */
/*  Component                                 */
/* ────────────────────────────────────────── */

export default function PlanPage() {
  const [step, setStep] = useState<Step>("select-plan");
  const [plan, setPlan] = useState<PlanChoice | null>(null);
  const [token, setToken] = useState<Token | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [txHash, setTxHash] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { session } = useAuth();
  const { isPro, refetch: refetchPlan } = usePlan();

  const selectedNetwork = NETWORKS.find((n) => n.id === network);
  const tokenAddress =
    selectedNetwork && token
      ? token === "USDT"
        ? selectedNetwork.token_usdt
        : selectedNetwork.token_usdc
      : undefined;

  const handleCopy = (text: string, key: string = "default") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setToast("Copied to clipboard");
    setTimeout(() => { setCopiedKey(null); setToast(null); }, 1500);
  };

  const handleSelectPlan = (p: PlanChoice) => {
    setPlan(p);
    setStep("select-token");
  };

  const handleSelectToken = (t: Token) => {
    setToken(t);
    setStep("select-network");
  };

  const handleSelectNetwork = (n: Network) => {
    setNetwork(n);
    setStep("show-details");
  };

  const handleVerify = async () => {
    if (!txHash.trim() || !network || !token || !plan) return;
    setVerifying(true);
    setVerifyError(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers,
        body: JSON.stringify({
          txHash: txHash.trim(),
          chain: network,
          token,
          amount: parseFloat(PLAN_PRICES[plan].amount),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        refetchPlan();
        setStep("success");
      } else {
        setVerifyError(data.error || "Payment verification failed. Please check the transaction hash and try again.");
      }
    } catch {
      setVerifyError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    setStep("select-plan");
    setPlan(null);
    setToken(null);
    setNetwork(null);
    setTxHash("");
    setVerifyError(null);
  };

  /* ── Shared styles ── */
  const card =
    "rounded-2xl border border-gray-200 p-6 transition-all hover:border-gray-300 cursor-pointer";
  const cardSelected =
    "rounded-2xl border-2 border-gray-900 p-6 bg-gray-50";
  const btnPrimary =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium transition-colors hover:bg-gray-800 cursor-pointer";
  const btnSecondary =
    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white transition-colors hover:bg-gray-50 hover:border-gray-300 cursor-pointer";

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Stipple wallet background decoration */}
      <div
        className="absolute top-24 right-0 w-[300px] h-[300px] pointer-events-none opacity-[0.04] translate-x-1/3"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wallet-v5.png"
          alt=""
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>

      {/* Top bar */}
      <div className="max-w-lg mx-auto px-4 pt-8 pb-4 relative z-10">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to app
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(98,126,234,0.2) 0%, rgba(153,69,255,0.2) 100%)",
              border: "1px solid rgba(98,126,234,0.3)",
            }}
          >
            <Sparkles size={16} style={{ color: "#627EEA" }} />
          </div>
          <span className="text-xl font-bold tracking-tight font-serif text-gray-900">
            Upgrade to Pro
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-16 relative z-10">
        {/* ── Already Pro ── */}
        {isPro && step === "select-plan" && (
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight font-serif text-gray-900">
              Pro plan active
            </h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              You have full access to all Pro features. Thank you for your support!
            </p>
            <div className="pt-4">
              <Link href="/app" className={btnPrimary}>
                Go to app
              </Link>
            </div>
          </div>
        )}

        {/* ── Step: Select Plan ── */}
        {!isPro && step === "select-plan" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-6">
              Unlock unlimited wallets, advanced analytics, and priority
              support. Pay with stablecoins on your preferred chain.
            </p>

            <button
              onClick={() => handleSelectPlan("monthly")}
              className={`${card} w-full text-left`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 font-serif">
                    Monthly
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Billed every month
                  </p>
                </div>
                <p className="text-2xl font-bold tracking-tight font-serif text-gray-900">
                  $0.99
                </p>
              </div>
            </button>

            <button
              onClick={() => handleSelectPlan("yearly")}
              className={`${card} w-full text-left relative`}
            >
              <span className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full border border-green-100">
                Save 17%
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 font-serif">
                    Yearly
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Billed once a year
                  </p>
                </div>
                <p className="text-2xl font-bold tracking-tight font-serif text-gray-900">
                  $9.99
                </p>
              </div>
            </button>

            <div className="pt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Pro includes
              </p>
              {[
                "Unlimited wallets",
                "All 16 blockchains",
                "PnL analytics & charts",
                "DeFi position tracking",
                "Price alerts",
                "Smart Allocator (AI)",
                "Priority support",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step: Select Token ── */}
        {step === "select-token" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              Select stablecoin for payment
            </p>
            <p className="text-xs text-gray-300 mb-4">
              Plan: {plan === "monthly" ? "Monthly" : "Yearly"} &mdash;{" "}
              {PLAN_PRICES[plan!].label}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(["USDT", "USDC"] as Token[]).map((t) => {
                const ti = TOKEN_ICONS[t];
                return (
                  <button
                    key={t}
                    onClick={() => handleSelectToken(t)}
                    className={`${card} text-center`}
                  >
                    <div className="flex justify-center mb-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: ti.bg, border: `1px solid ${ti.color}22` }}
                      >
                        <img src={ti.icon} alt={t} className="w-6 h-6 rounded-full" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 font-serif">
                      {t}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t === "USDT" ? "Tether" : "USD Coin"}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setStep("select-plan");
                setToken(null);
              }}
              className={`${btnSecondary} w-full mt-4`}
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        )}

        {/* ── Step: Select Network ── */}
        {step === "select-network" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">Select network</p>
            <p className="text-xs text-gray-300 mb-4">
              {token} &mdash; {PLAN_PRICES[plan!].label}
            </p>

            <div className="space-y-2">
              {NETWORKS.filter((n) =>
                token === "USDT" ? !!n.token_usdt : !!n.token_usdc
              ).map((n) => {
                const ci = CHAIN_ICONS[n.id];
                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelectNetwork(n.id)}
                    className={`${card} w-full text-left flex items-center gap-3`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: ci.bg, border: `1px solid ${ci.color}22` }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ background: ci.color }} />
                    </div>
                    <p className="font-medium text-gray-900">{n.name}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setStep("select-token");
                setNetwork(null);
              }}
              className={`${btnSecondary} w-full mt-4`}
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        )}

        {/* ── Step: Payment Details ── */}
        {step === "show-details" && (
          <div className="space-y-5">
            <div className={cardSelected}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Payment details
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-gray-900">
                    Pro {plan === "monthly" ? "Monthly" : "Yearly"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {PLAN_PRICES[plan!].amount} {token}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Network</span>
                  <span className="font-medium text-gray-900">
                    {selectedNetwork?.name}
                  </span>
                </div>
                {tokenAddress && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Token contract</span>
                    <span className="font-mono text-xs text-gray-400">
                      {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receiving address + QR */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Send to this address
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <code className="flex-1 text-xs font-mono text-gray-700 break-all select-all">
                  {PAYMENT_WALLET}
                </code>
                <button
                  onClick={() => handleCopy(PAYMENT_WALLET, "wallet")}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 cursor-pointer"
                  title="Copy address"
                >
                  {copiedKey === "wallet" ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* QR Code placeholder */}
              <div className="mt-3 flex justify-center">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-1.5">
                    <rect x="4" y="4" width="12" height="12" rx="1" stroke="#D4D4D4" strokeWidth="1.5" fill="none" />
                    <rect x="7" y="7" width="6" height="6" rx="0.5" fill="#D4D4D4" />
                    <rect x="24" y="4" width="12" height="12" rx="1" stroke="#D4D4D4" strokeWidth="1.5" fill="none" />
                    <rect x="27" y="7" width="6" height="6" rx="0.5" fill="#D4D4D4" />
                    <rect x="4" y="24" width="12" height="12" rx="1" stroke="#D4D4D4" strokeWidth="1.5" fill="none" />
                    <rect x="7" y="27" width="6" height="6" rx="0.5" fill="#D4D4D4" />
                    <rect x="24" y="24" width="4" height="4" rx="0.5" fill="#D4D4D4" />
                    <rect x="30" y="24" width="4" height="4" rx="0.5" fill="#D4D4D4" />
                    <rect x="24" y="30" width="4" height="4" rx="0.5" fill="#D4D4D4" />
                    <rect x="32" y="32" width="4" height="4" rx="0.5" fill="#D4D4D4" />
                    <rect x="18" y="4" width="3" height="3" rx="0.5" fill="#D4D4D4" />
                    <rect x="18" y="18" width="3" height="3" rx="0.5" fill="#D4D4D4" />
                    <rect x="4" y="18" width="3" height="3" rx="0.5" fill="#D4D4D4" />
                  </svg>
                  <span className="text-[9px] text-gray-300 font-medium">QR Code</span>
                </div>
              </div>
            </div>

            {/* Token contract address */}
            {tokenAddress && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Token contract ({token} on {selectedNetwork?.name})
                </p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <code className="flex-1 text-[11px] font-mono text-gray-500 break-all select-all">
                    {tokenAddress}
                  </code>
                  <button
                    onClick={() => handleCopy(tokenAddress, "contract")}
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 cursor-pointer"
                    title="Copy contract address"
                  >
                    {copiedKey === "contract" ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-300 mt-1.5">
                  Add this token to your wallet to see {token} balance on {selectedNetwork?.name}
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700">
                Send exactly{" "}
                <strong>
                  {PLAN_PRICES[plan!].amount} {token}
                </strong>{" "}
                on <strong>{selectedNetwork?.name}</strong>. Do not send any
                other token or amount.
              </p>
            </div>

            <button
              onClick={() => setStep("verify")}
              className={btnPrimary}
            >
              <Wallet size={14} />
              I&apos;ve sent the payment
            </button>

            <button
              onClick={() => {
                setStep("select-network");
                setNetwork(null);
              }}
              className={`${btnSecondary} w-full`}
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        )}

        {/* ── Step: Verify ── */}
        {step === "verify" && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              Paste your transaction hash so we can verify the payment.
            </p>

            {verifyError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{verifyError}</p>
              </div>
            )}

            <input
              type="text"
              placeholder="0x..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 font-mono placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors bg-white"
            />

            <button
              onClick={handleVerify}
              disabled={!txHash.trim() || verifying}
              className={`${btnPrimary} ${
                !txHash.trim() || verifying ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {verifying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Verify payment
                </>
              )}
            </button>

            <button
              onClick={() => { setStep("show-details"); setVerifyError(null); }}
              className={`${btnSecondary} w-full`}
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === "success" && (
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight font-serif text-gray-900">
              Payment received!
            </h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Your Pro plan is now active. It may take a few minutes for
              on-chain confirmation.
            </p>
            <div className="pt-4 space-y-2">
              <Link href="/app" className={btnPrimary}>
                Go to app
              </Link>
              <button onClick={handleReset} className={`${btnSecondary} w-full`}>
                Make another payment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium shadow-lg">
            <Check size={14} className="text-green-400" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
