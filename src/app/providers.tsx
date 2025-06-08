// src/app/providers.tsx
"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter, // Dodany dla większej kompatybilności mobilnej
  TrustWalletAdapter,     // Dodany dla większej kompatybilności mobilnej
  LedgerWalletAdapter,    // Opcjonalnie, dla wsparcia Ledger
  // Dodaj inne, jeśli chcesz wspierać więcej portfeli, np.
  // SlopeWalletAdapter,
  // SolletWalletAdapter,
  // SolletExtensionWalletAdapter,
  // MathWalletAdapter,
  // ExodWalletAdapter,
  // GlowWalletAdapter,
  // BackpackWalletAdapter,
  // TokenPocketWalletAdapter,
  // BitkeepWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
// Wymagana konfiguracja Wagmi, upewnij się, że ten plik istnieje
import { config as wagmiConfig } from "../wagmiConfig"; 
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"; 
import { clusterApiUrl } from "@solana/web3.js"; 

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const solanaNetwork = WalletAdapterNetwork.Mainnet; 
  // Użyj swojego klucza API Helius w zmiennej środowiskowej
  // lub, jeśli to jest produkcja, upewnij się, że klucz jest bezpiecznie zarządzany.
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(solanaNetwork), [solanaNetwork]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}