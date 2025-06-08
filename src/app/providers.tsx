// src/app/providers.tsx
"use client"; // To jest komponent kliencki

import React, { useMemo } from "react";
import {
  ConnectionProvider, // Dostawca połączenia z siecią Solana
  WalletProvider,     // Dostawca kontekstu portfela Solana
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider, // Dostawca modalnego okna wyboru portfela
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter, // Dodany dla większej kompatybilności mobilnej
  TrustWalletAdapter,     // Dodany dla większej kompatybilności mobilnej
  LedgerWalletAdapter,    // Opcjonalnie, dla wsparcia Ledger
  // Możesz dodać więcej, jeśli chcesz wspierać inne portfele:
  // SlopeWalletAdapter,
  // SolletWalletAdapter,
  // SolletExtensionWalletAdapter,
  // MathWalletAdapter,
  // ExodWalletAdapter,
  // GlowWalletAdapter,
  // BackpackWalletAdapter,
  // TokenPocketWalletAdapter,
  // BitkeepWalletAdapter,
} from "@solana/wallet-adapter-wallets"; // Biblioteka z adapterami portfeli Solana
import {
  QueryClient,
  QueryClientProvider, // Dla Wagmi i React Query
} from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config as wagmiConfig } from "../wagmiConfig"; // Konfiguracja Wagmi dla Ethereum
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"; // Do określania sieci Solany
import { clusterApiUrl } from "@solana/web3.js"; // Do generowania URL endpointu Solana

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // Określamy sieć Solany
  const solanaNetwork = WalletAdapterNetwork.Mainnet; // Użyj Mainnet dla produkcji
  // lub WalletAdapterNetwork.Devnet / WalletAdapterNetwork.Testnet dla testów
  
  // Endpoint RPC dla Solany (Twoj klucz Helius jest w porządku)
  const endpoint = useMemo(() => `https://mainnet.helius-rpc.com/?api-key=7cf29ae9-25cc-4afb-8c3f-a455ee5542b2`, []);
  // Możesz też użyć clusterApiUrl(solanaNetwork) jeśli chcesz używać domyślnych endpointów publicznych
  // const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), [solanaNetwork]);

  // Lista adapterów portfeli do wstrzyknięcia do WalletProvider
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    // Pusta tablica zależności oznacza, że wallets zostaną zainicjowane tylko raz.
    // Jeśli chciałbyś dynamicznie zmieniać sieć, musiałbyś dodać `solanaNetwork` tutaj.
    [] 
  );

  return (
    // Owijamy aplikację w WagmiProvider dla obsługi Ethereum
    <WagmiProvider config={wagmiConfig}>
      {/* QueryClientProvider jest wymagany przez Wagmi i React Query */}
      <QueryClientProvider client={queryClient}>
        {/* ConnectionProvider konfiguruje połączenie z siecią Solana */}
        <ConnectionProvider endpoint={endpoint}>
          {/* WalletProvider dostarcza kontekst portfela Solana dla całej aplikacji */}
          <WalletProvider wallets={wallets} autoConnect> {/* autoConnect próbuje automatycznie połączyć portfel */}
            {/* WalletModalProvider wyświetla interfejs wyboru portfela */}
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}