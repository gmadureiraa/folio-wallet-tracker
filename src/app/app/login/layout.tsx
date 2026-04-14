import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Folio",
  description: "Sign in to Folio to access your multi-chain wallet tracker.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
