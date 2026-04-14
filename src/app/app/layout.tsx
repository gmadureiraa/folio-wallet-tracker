import type { Metadata } from "next";
import { ThemeProvider } from "../../lib/theme";
import { AuthProvider } from "../../lib/auth-context";

export const metadata: Metadata = {
  title: "Dashboard — Folio Wallet Tracker",
  description:
    "Track wallets across 16 EVM chains and Solana. Real-time portfolio, DeFi positions, NFTs, PnL analytics, and more. Pay with crypto.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}
