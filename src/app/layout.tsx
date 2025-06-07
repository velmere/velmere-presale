// src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // Poprawny import fontów Geist
import { GeistMono } from "geist/font/mono"; // Poprawny import fontów Geist
import "./globals.css";
import { Providers } from "./providers"; // Importuje Providers (dla Wagmi/Solana Wallet)

export const metadata: Metadata = {
  title: "Velmere - Luksusowa Moda Blockchain",
  description: "Luksusowa moda spotyka technologię blockchain. Odkryj kolekcje Velmere i token VLM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning={true} // Ważne dla uniknięcia błędów hydracji z fontami
      >
        <Providers> {/* Owija całą aplikację w dostawców portfeli */}
          {children}
        </Providers>
      </body>
    </html>
  );
}