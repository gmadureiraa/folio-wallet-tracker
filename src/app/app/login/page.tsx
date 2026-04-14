"use client";

import { useState, useEffect } from "react";
import { Wallet, Mail, Lock, ArrowRight, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/app");
    }
  }, [user, loading, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        const result = await signInWithEmail(email, password);
        if (result.error) {
          setError(result.error);
        }
        // On success, the auth state change will trigger the redirect above
      } else {
        const result = await signUpWithEmail(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccessMsg("Check your email to confirm your account.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start Google sign-in.";
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleWallet = () => {
    // TODO: Wire WalletConnect / MetaMask
    window.location.href = "/app";
  };

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Stipple wallet background decoration */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-[0.04]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wallet-v5.png"
          alt=""
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>

      {/* Login art decoration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/folio-login-art.png"
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] pointer-events-none opacity-30 hidden lg:block"
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5 mb-10">
        <img src="/folio-logo-icon.png" className="w-12 h-12" alt="Folio" />
        <span className="text-2xl font-bold tracking-tight font-serif text-gray-900">
          Folio
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm relative z-10">
        <h1 className="text-2xl font-bold tracking-tight text-center mb-1 font-serif text-gray-900">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          {mode === "login"
            ? "Sign in to access your portfolio"
            : "Start tracking your wallets for free"}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        {/* Email form — primary login method */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 mb-6">
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors bg-white"
            />
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium transition-colors hover:bg-gray-800 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign in" : "Create account"}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Social auth buttons — secondary */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-500 bg-white transition-colors hover:bg-gray-50 hover:border-gray-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={14} className="animate-spin text-gray-400" />
            ) : (
              <>
                <Globe size={16} className="text-gray-400" />
                Continue with Google
              </>
            )}
          </button>

          <button
            onClick={handleWallet}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-500 bg-white transition-colors hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
          >
            <Wallet size={16} className="text-gray-400" />
            Connect Wallet
          </button>

          <p className="text-[10px] text-center text-gray-300 mt-1">
            Google sign-in may not be available yet. Use email &amp; password above.
          </p>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-sm text-gray-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
                className="text-gray-700 font-medium hover:text-gray-900 transition-colors cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                className="text-gray-700 font-medium hover:text-gray-900 transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Skip auth */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link
            href="/app"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Track a wallet without account →
          </Link>
        </div>
      </div>
    </div>
  );
}
