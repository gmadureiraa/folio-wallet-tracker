import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade to Pro — Folio",
  description: "Unlock unlimited wallets, advanced analytics, and priority support. Pay with stablecoins.",
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
