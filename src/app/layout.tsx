import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Organizador de Abas — Guarde, Organize e Reabra Links",
  description:
    "Organizador elegante de abas e links pessoais com grupos, busca instantânea e integração com n8n.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${manrope.variable} h-full dark`}
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] antialiased font-sans selection:bg-[#c86446]/30 selection:text-[#f4f4f6]">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
