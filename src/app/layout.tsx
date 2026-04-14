import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Folio — Multi-Chain Wallet Tracker | Track Every Token",
  description:
    "Folio scans 16 blockchains, tracks real-time prices, calculates PnL, and shows your complete crypto portfolio. NFTs included. Read-only. No keys required.",
  icons: { icon: "/folio-logo-icon.png" },
  openGraph: {
    title: "Folio — Multi-Chain Wallet Tracker",
    description: "Track every token across every chain. Real-time prices, PnL, NFTs. Read-only, no keys required.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full dark`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
