import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Folio — Multi-Chain Wallet Tracker | Track Every Token",
  description: "Folio scans 16 blockchains, tracks real-time prices, calculates PnL, and shows your complete crypto portfolio.",
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
