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
  metadataBase: new URL("https://folio-landing.vercel.app"),
  title: "Folio — Multi-Chain Wallet Tracker | Track Every Token",
  description:
    "Folio scans 16 blockchains, tracks real-time prices, calculates PnL, and shows your complete crypto portfolio. NFTs included. Read-only. No keys required.",
  icons: { icon: "/folio-logo-icon.png" },
  openGraph: {
    title: "Folio — Track Every Token Across Every Chain",
    description: "Multi-chain wallet tracker. 16 blockchains, real-time prices, PnL, NFTs. Free. Read-only. No keys required.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Folio — Multi-Chain Wallet Tracker",
    description: "Track every token across every chain. Free.",
    images: ["/og-image.png"],
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full dark`}>
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Folio",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              description:
                "Multi-chain crypto wallet tracker. Scans 16 blockchains, tracks real-time prices, calculates PnL, and shows your complete portfolio.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
