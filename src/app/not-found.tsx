import Link from "next/link";
import { Wallet } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — Folio",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
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

      {/* Content */}
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold font-serif text-gray-900 mb-2">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2 font-serif">
          Page not found
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium transition-colors hover:bg-gray-800"
          >
            Go to homepage
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white transition-colors hover:bg-gray-50 hover:border-gray-300"
          >
            Open app
          </Link>
        </div>
      </div>
    </div>
  );
}
