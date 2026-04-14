import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Folio",
  description: "Manage your Folio account, preferences, tracked wallets, and subscription.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
