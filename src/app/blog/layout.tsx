import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Folio | Crypto Portfolio Tracking Guides",
  description:
    "Learn about crypto portfolio tracking, DeFi, self-custody, and wallet security.",
  openGraph: {
    title: "Blog — Folio | Crypto Portfolio Tracking Guides",
    description:
      "Learn about crypto portfolio tracking, DeFi, self-custody, and wallet security.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
