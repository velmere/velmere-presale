// src/wagmiConfig.ts
import { http, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { injected } from 'wagmi/connectors'; // <-- Dodaj ten import

export const config = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    // Jeśli używasz innych łańcuchów, dodaj je tutaj.
  },
  // KLUCZOWA ZMIANA: Dodanie injected connector
  connectors: [
    injected(), // To umożliwia połączenie z MetaMask i innymi portfelami wstrzykiwanymi do przeglądarki
  ],
});