"use client";

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// Solana Imports
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, ComputeBudgetProgram } from "@solana/web3.js";

// Ethereum Imports (Wagmi V2+)
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useDisconnect,
  useSwitchChain,
  useWaitForTransactionReceipt // Dodajemy useWaitForTransactionReceipt, aby poprawnie czekać na hash
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem';
import { mainnet } from 'wagmi/chains';

// Domyślne wartości
const MIN_PURCHASE_USD = 10;
const TARGET_USD = 1000000;
const PRESALE_START_DATE = new Date('2025-06-07T00:00:00Z');
const BASE_PRICE_USD = 0.1;

// KOMPONENT LICZNIKA CZASU (BEZ NAPISU)
const CountdownTimer = () => {
    // WAŻNA UWAGA: Ten komponent powinien być renderowany tylko na kliencie,
    // aby uniknąć błędów hydracji związanych z Date.now()
    // Używamy `isClient` w komponencie nadrzędnym do warunkowego renderowania.
    const calculateTimeLeft = () => {
        const difference = +new Date("2026-01-02T00:00:00") - +new Date();
        let timeLeft = { Dni: 0, Godziny: 0, Minuty: 0, Sekundy: 0 };

        if (difference > 0) {
            timeLeft = {
                Dni: Math.floor(difference / (1000 * 60 * 60 * 24)),
                Godziny: Math.floor((difference / (1000 * 60 * 60)) % 24),
                Minuty: Math.floor((difference / 1000 / 60) % 60),
                Sekundy: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex justify-center gap-3 md:gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center bg-black/20 p-3 rounded-lg w-20">
                    <div className="countdown-number text-4xl lg:text-5xl font-bold text-white">
                        {String(value).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{unit}</div>
                </div>
            ))}
        </div>
    );
};


// KOMPONENT ANIMACJI PIASKU
const SandAnimation = () => {
  // WAŻNA UWAGA: Ten komponent również powinien być renderowany tylko na kliencie,
  // ze względu na Math.random(). Używamy `isClient` w komponencie nadrzędnym do warunkowego renderowania.
  const sandContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = sandContainerRef.current;
    if (!container) return;

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const numberOfGrains = 100;

    for (let i = 0; i < numberOfGrains; i++) {
        const grain = document.createElement('div');
        grain.className = 'sand-grain';
        const startX = 95 + (Math.random() - 0.5) * 10;
        grain.style.left = `${startX}px`;
        const endX = (Math.random() - 0.5) * 40;
        grain.style.setProperty('--x-end', `${endX}px`);
        grain.style.animationDelay = `${Math.random() * 5}s`;
        grain.style.animationDuration = `${1 + Math.random() * 2}s`;
        container.appendChild(grain);
    }
  }, []);

  return (
    <div ref={sandContainerRef} className="relative w-[200px] h-[300px] overflow-hidden">
        {/* Ziarna piasku są generowane przez useEffect */}
    </div>
  );
};


export default function PresalePage() {
  // Funkcja do skracania adresu
  const truncateAddress = (address: string, chars = 4) => {
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  };

  // Komponent ikony do potwierdzenia skopiowania
  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  // ADRESY PORTFELI
  const ethReceiveAddress = "0xeE88B7Ea3AcdE5eb44c36EBA361564E69286ab82";
  const solReceiveAddress = "BYXm8WutiWaB4S14SefJWHBmT1WYv8eLYGobzVBtz5NR";
  const suiReceiveAddress = "0xcdcccb3d305b023e9fdd239f301c99538c8791063f1fc5ca2f2451f7877cd0ff";

  // Stany komponentu
  const [currentVlmPrice, setCurrentVlmPrice] = useState(BASE_PRICE_USD);
  const [userTokenBalance, setUserTokenBalance] = useState<number | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedNetworkForPayment, setSelectedNetworkForPayment] = useState<"ethereum" | "solana" | "sui" | null>(null);
  const [amountToBuy, setAmountToBuy] = useState<number>(MIN_PURCHASE_USD);
  const [vlmAmount, setVlmAmount] = useState<number>(0);
  const [purchaseCurrencyAmount, setPurchaseCurrencyAmount] = useState<number>(0);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info", text: string } | null>(null);
  const [totalRaisedUSD, setTotalRaisedUSD] = useState<number>(0);
  const [investmentProgress, setInvestmentProgress] = useState<number>(0);
  const [liveExchangeRates, setLiveExchangeRates] = useState({ ETH_USD: 3500, SOL_USD: 150, SUI_USD: 1.2 });
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const ethQrCanvasRef = useRef<HTMLCanvasElement>(null);
  const solQrCanvasRef = useRef<HTMLCanvasElement>(null);
  const suiQrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Hooks Wagmi i Solana
  const { connection } = useConnection();
  const { connected: solanaConnected, publicKey: solanaPublicKey, sendTransaction: solanaSendTransaction, disconnect: solanaDisconnect, wallet } = useWallet();
  const { address: ethAddress, isConnected: isEthConnected, chain: ethChain } = useAccount();
  const { connect } = useConnect();
  
  // ZMODYFIKOWANO: Pobieramy `sendTransaction` (funkcję do wywołania) i `data` (hash transakcji po wywołaniu)
  const { sendTransaction: wagmiSendTransaction, data: wagmiTxHashFromHook } = useSendTransaction();
  const { disconnect: ethDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // ZMODYFIKOWANO: Użycie `useWaitForTransactionReceipt` do monitorowania statusu transakcji Wagmi
  // `wagmiTxHashFromHook` jest używany jako `hash` do monitorowania.
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash: wagmiTxHashFromHook, 
  });


  useEffect(() => { setIsClient(true); }, []);

  // Efekt do obliczania dynamicznej ceny
  useEffect(() => {
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - PRESALE_START_DATE.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    const newPrice = BASE_PRICE_USD * Math.pow(1.03, diffWeeks);
    setCurrentVlmPrice(newPrice);
  }, []);
  
  // Pobieranie globalnego postępu z bazy danych przy starcie
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/get-progress');
        const data = await response.json();
        if (response.ok) {
          setTotalRaisedUSD(data.totalRaisedUSD);
        } else {
          setTotalRaisedUSD(70000);
        }
      } catch (error) {
        console.error("Nie udało się pobrać postępu:", error);
        setTotalRaisedUSD(70000);
      }
    };
    fetchProgress();
  }, []);

  // Efekt do pobierania cen
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/prices');
        const data = await response.json();
        if (response.ok) setLiveExchangeRates(data); else setPricesError('Nie udało się pobrać cen.');
      } catch (error) { setPricesError('Błąd połączenia z serwerem cen.'); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Efekt do generowania QR kodów
  useEffect(() => {
    const qrOptions = { width: 180, margin: 1 };
    if (isClient) {
      if (ethQrCanvasRef.current) QRCode.toCanvas(ethQrCanvasRef.current, ethReceiveAddress, qrOptions).catch(console.error);
      if (solQrCanvasRef.current) QRCode.toCanvas(solQrCanvasRef.current, solReceiveAddress, qrOptions).catch(console.error);
      if (suiQrCanvasRef.current) QRCode.toCanvas(suiQrCanvasRef.current, suiReceiveAddress, qrOptions).catch(console.error);
    }
  }, [isClient, ethReceiveAddress, solReceiveAddress, suiReceiveAddress]);

  // Efekty do obliczeń
  useEffect(() => {
    if (amountToBuy > 0 && selectedNetworkForPayment && currentVlmPrice > 0) {
      setVlmAmount(amountToBuy / currentVlmPrice);
      let rate = 1;
      if (selectedNetworkForPayment === "ethereum") rate = liveExchangeRates.ETH_USD;
      else if (selectedNetworkForPayment === "solana") rate = liveExchangeRates.SOL_USD;
      else if (selectedNetworkForPayment === "sui") rate = liveExchangeRates.SUI_USD;
      setPurchaseCurrencyAmount(amountToBuy / rate);
    }
  }, [amountToBuy, selectedNetworkForPayment, liveExchangeRates, currentVlmPrice]);

  useEffect(() => {
    setInvestmentProgress((totalRaisedUSD / TARGET_USD) * 100);
  }, [totalRaisedUSD]);

  // Ustawia sieć ORAZ pobiera balans tokenów użytkownika
  useEffect(() => {
    const checkUserBalance = async (address: string) => {
      try {
        const response = await fetch('/api/get-user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        });
        const data = await response.json();
        if (response.ok) {
          setUserTokenBalance(data.totalTokenBalance);
        }
      } catch (error) {
        console.error("Błąd pobierania danych użytkownika:", error);
      }
    };

    setUserTokenBalance(null);

    if (solanaConnected && wallet && solanaPublicKey) {
      const walletName = wallet.adapter.name;
      if (walletName.toLowerCase().includes('metamask')) {
        if (!isEthConnected) { connect({ connector: injected() }); }
        setSelectedNetworkForPayment("ethereum");
        if (ethAddress) checkUserBalance(ethAddress);
      } else {
        setSelectedNetworkForPayment("solana");
        checkUserBalance(solanaPublicKey.toBase58());
      }
    } else if (isEthConnected && !solanaConnected && ethAddress) {
      setSelectedNetworkForPayment("ethereum");
      checkUserBalance(ethAddress);
    } else {
      setSelectedNetworkForPayment(null);
    }
  }, [solanaConnected, isEthConnected, ethAddress, solanaPublicKey, wallet, connect]);

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleBuy = async () => {
    setMessage(null);
    if (amountToBuy < MIN_PURCHASE_USD) return setMessage({ type: "error", text: `Minimalna kwota to ${MIN_PURCHASE_USD} USD.` });
    if (!selectedNetworkForPayment) return setMessage({ type: "error", text: "Wybierz sieć płatności." });

    if (selectedNetworkForPayment === "ethereum" && !isEthConnected) return setMessage({ type: "error", text: "Połącz portfel Ethereum." });
    if (selectedNetworkForPayment === "solana" && !solanaConnected) return setMessage({ type: "error", text: "Połącz portfel Solana." });
    if (selectedNetworkForPayment === 'sui') return setMessage({ type: "info", text: "Płatność w SUI nie jest jeszcze dostępna." });

    try {
      setMessage({ type: "info", text: "Otwórz portfel, aby zatwierdzić transakcję..." });

      if (selectedNetworkForPayment === "ethereum") {
        if (!ethAddress) throw new Error("Brak adresu ETH.");
        if (ethChain?.id !== mainnet.id) {
          await switchChain?.({ chainId: mainnet.id });
          return setMessage({ type: "error", text: "Proszę zmienić sieć na Ethereum Mainnet i spróbować ponownie." });
        }
        
        // ZMODYFIKOWANO LOGIKĘ WAGMI:
        // Wywołujemy `wagmiSendTransaction`. Hash transakcji (`wagmiTxHashFromHook`)
        // będzie dostępny ASYNCHRONICZNIE PO tym, jak użytkownik zaakceptuje transakcję w swoim portfelu.
        wagmiSendTransaction({ 
            to: ethReceiveAddress, 
            value: parseEther(purchaseCurrencyAmount.toFixed(18)) 
        });

        // POLECENIE:
        // Po wywołaniu wagmiSendTransaction, funkcja handleBuy NIE MOŻE natychmiastowo zakładać,
        // że hash jest dostępny. Dalsza logika dla transakcji Ethereum (aktualizacja UI, wysyłka do API)
        // MUSI być obsługiwana przez useEffect, który monitoruje `wagmiTxHashFromHook`
        // i `isConfirmed` (z useWaitForTransactionReceipt).
        // Zatem, dla Ethereum, ta funkcja handleBuy tutaj się kończy, po zainicjowaniu transakcji.
        return; // Zakończ funkcję, aby nie kontynuować synchronizacyjnie z hashem, który jeszcze nie nadszedł.

      } else if (selectedNetworkForPayment === "solana") {
        if (!solanaPublicKey || !solanaSendTransaction) throw new Error("Portfel Solana nie jest gotowy.");

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 });
        const transaction = new Transaction().add(addPriorityFee).add(
          SystemProgram.transfer({
            fromPubkey: solanaPublicKey,
            toPubkey: new PublicKey(solReceiveAddress),
            lamports: Math.floor(purchaseCurrencyAmount * LAMPORTS_PER_SOL),
          })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = solanaPublicKey;

        const signature = await solanaSendTransaction(transaction, connection);
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
        
        // OBSŁUGA SOLANA: Hash jest dostępny synchronicznie po potwierdzeniu.
        const txHash = signature; 
        
        // ZMODYFIKOWANO: Przeniesiono wspólną logikę do funkcji pomocniczej
        // dla czystości kodu i uniknięcia duplikacji.
        await processTransactionAfterHash(txHash, selectedNetworkForPayment, ethAddress || solanaPublicKey.toBase58(), amountToBuy, vlmAmount, purchaseCurrencyAmount);
      }
    } catch (e: any) {
      return setMessage({ type: "error", text: e.message.includes("User rejected") || e.name === "TransactionExecutionError" ? "Transakcja odrzucona przez użytkownika." : `Błąd: ${e.message}` });
    }
  };

  // ZMODYFIKOWANO: Funkcja pomocnicza do przetwarzania transakcji po uzyskaniu hasha.
  // Dzięki temu kod jest bardziej modułowy i łatwiejszy do zarządzania.
  const processTransactionAfterHash = async (txHash: string, network: "ethereum" | "solana" | "sui", walletAddress: string, usdAmount: number, tokenAmount: number, currencyAmount: number) => {
      setMessage({ type: "success", text: `Transakcja wysłana! Hash: ${txHash.substring(0, 10)}...` });
      setTotalRaisedUSD(prev => prev + usdAmount);

      try {
        const response = await fetch('/api/process-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            txHash: txHash,
            network: network.toUpperCase(),
            amount: currencyAmount,
            tokenAmount: tokenAmount,
            usdAmount: usdAmount,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log("Serwer pomyślnie zarejestrował transakcję:", data.message);
          setUserTokenBalance(prev => (prev || 0) + tokenAmount);
        } else {
          console.error("Błąd podczas wysyłania danych do serwera:", data.error);
        }
      } catch (error) {
        console.error("Nie udało się połączyć z API serwera:", error);
      }
  };

  // ZMODYFIKOWANO: useEffect do monitorowania statusu transakcji Wagmi
  // Ta logika będzie wykonywana PO tym, jak użytkownik zaakceptuje transakcję w portfelu
  // i Wagmi zwróci hash, a następnie po potwierdzeniu transakcji w sieci.
  useEffect(() => {
    if (wagmiTxHashFromHook && isConfirmed) {
        setMessage({ type: "success", text: `Transakcja Ethereum potwierdzona! Hash: ${wagmiTxHashFromHook.substring(0, 10)}...` });
        
        // Wywołujemy wspólną funkcję do przetwarzania transakcji
        processTransactionAfterHash(
            wagmiTxHashFromHook, 
            "ethereum", 
            ethAddress || '', // ethAddress powinien być dostępny, ale dla pewności pusty string
            amountToBuy, 
            vlmAmount, 
            purchaseCurrencyAmount
        );

    } else if (wagmiTxHashFromHook && isConfirming) {
        setMessage({ type: "info", text: `Transakcja Ethereum w trakcie potwierdzania... Hash: ${wagmiTxHashFromHook.substring(0, 10)}...` });
    }
  }, [wagmiTxHashFromHook, isConfirmed, isConfirming, ethAddress, amountToBuy, vlmAmount, purchaseCurrencyAmount]);


  const isAnyWalletConnected = isEthConnected || solanaConnected;

  const handleDisconnect = () => {
    if (isEthConnected) ethDisconnect();
    if (solanaConnected) solanaDisconnect().catch(e => console.error("Solana disconnect error", e));
  };

  const getConnectedDisplayAddress = () => {
    if (isEthConnected && ethAddress) return `ETH: ${ethAddress.slice(0, 6)}...${ethAddress.slice(-4)}`;
    if (solanaConnected && solanaPublicKey) return `SOL: ${solanaPublicKey.toBase58().slice(0, 6)}...${solanaPublicKey.toBase58().slice(-4)}`;
    return null;
  };

  return (
    <div
      className="min-h-screen text-white font-sans flex flex-col items-center overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/gold.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <style>{`
        @keyframes subtle-bob {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .vlm-logo-animation {
          animation: subtle-bob 4s ease-in-out infinite;
        }
        .sand-grain {
          position: absolute;
          width: 2px;
          height: 2px;
          background-color: #c2b280;
          border-radius: 50%;
          top: -5px;
          animation: fall linear infinite;
        }
        @keyframes fall {
          from {
            transform: translateY(-5px) translateX(0);
            opacity: 1;
          }
          to {
            transform: translateY(305px) translateX(var(--x-end));
            opacity: 0;
          }
        }
        @keyframes pulse-glow {
          0% { text-shadow: 0 0 4px rgba(255, 255, 255, 0.3), 0 0 8px rgba(192, 132, 252, 0.2); }
          50% { text-shadow: 0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(192, 132, 252, 0.4); }
          100% { text-shadow: 0 0 4px rgba(255, 255, 255, 0.3), 0 0 8px rgba(192, 132, 252, 0.2); }
        }
        .countdown-number {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        @keyframes price-shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        .price-animation {
            background-image: linear-gradient( to right, #a855f7, #f0f9ff, #67e8f9, #a855f7 );
            background-size: 200% auto;
            color: transparent;
            background-clip: text;
            -webkit-background-clip: text;
            animation: price-shimmer 4s linear infinite;
        }
      `}</style>

      <header className="w-full absolute top-0 left-0 right-0 p-4 md:p-6 z-10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <a href="https://velmere.pl" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold tracking-wider hover:opacity-80 transition-opacity">VLM</a>
        </div>
      </header>

      {/* ===== GŁÓWNA SEKCJA ===== */}
      <main className="flex-grow w-full flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 mt-[80px] lg:mt-0">
        
        <div className="hidden lg:flex flex-1 justify-start">
          <img
            src="/technologie.png"
            alt="Diagram technologii Velmere"
            className="rounded-lg max-w-lg xl:max-w-xl"
          />
        </div>

        <div className="w-full max-w-md flex-shrink-0">
          <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-500/10 p-8 border border-gray-800">

            {message && (<div className={`p-3 rounded-md mb-6 text-center text-sm ${message.type === "success" ? "bg-green-500/20 text-green-300" : ""} ${message.type === "error" ? "bg-red-500/20 text-red-300" : ""} ${message.type === "info" ? "bg-blue-500/20 text-blue-300" : ""}`}><p>{message.text}</p></div>)}

            <div className="text-center">
              <h1 className="text-4xl font-bold text-white vlm-logo-animation">VLM</h1>
              <p className="price-animation font-bold text-lg mt-2">
                1 VLM = ${Number(currentVlmPrice.toFixed(4))} USD
              </p>
              <p className="text-purple-400 font-semibold mt-2">${totalRaisedUSD.toLocaleString()} / ${TARGET_USD.toLocaleString()} ({investmentProgress.toFixed(2)}%)</p>
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-1">Investment Progress</p>
              <div className="bg-gray-800 rounded-full h-2.5"><div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${investmentProgress}%` }}></div></div>
            </div>

            {isClient && !isAnyWalletConnected && (
              <div className="mt-8 flex flex-col items-center">
                <p className="text-lg text-gray-300 mb-4">Zainwestuj używając portfela</p>
                <div className="[&>button]:bg-gray-700 [&>button]:hover:bg-gray-600">
                  <WalletMultiButton>Wybierz portfel</WalletMultiButton>
                </div>
              </div>
            )}

            {isClient && isAnyWalletConnected && (
              <div className="mt-8">
                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-md mb-4">
                  <p className="text-sm text-green-400">{getConnectedDisplayAddress()}</p>
                  <button onClick={handleDisconnect} className="text-xs bg-red-600/50 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">Rozłącz</button>
                </div>

                {userTokenBalance !== null && userTokenBalance > 0 && (
                  <div className="text-center bg-gray-800/50 p-3 rounded-lg mb-4">
                    <p className="text-gray-300">Twój zakupiony balans VLM:</p>
                    <p className="text-cyan-400 font-bold text-xl">{userTokenBalance.toLocaleString()} VLM</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-center text-sm text-gray-400">Dostępna metoda płatności:</p>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    {selectedNetworkForPayment === 'ethereum' && (<div className="font-semibold py-2 px-4 rounded-lg bg-purple-600 text-white w-full text-center">ETH</div>)}
                    {selectedNetworkForPayment === 'solana' && (<div className="font-semibold py-2 px-4 rounded-lg bg-cyan-600 text-white w-full text-center">SOL</div>)}
                    {!selectedNetworkForPayment && (<div className="font-semibold py-2 px-4 rounded-lg bg-gray-800 text-gray-400 w-full text-center">Wybieranie...</div>)}
                  </div>
                </div>

                {selectedNetworkForPayment && (
                  <>
                    <div className="my-6">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Kwota inwestycji (USD):</label>
                      <input type="number" id="amount" min={MIN_PURCHASE_USD} step="10" value={amountToBuy} onChange={(e) => setAmountToBuy(Math.max(MIN_PURCHASE_USD, parseFloat(e.target.value) || 0))} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="text-center bg-gray-800/50 p-4 rounded-lg">
                      <p className="text-gray-400">Otrzymasz:</p>
                      <p className="text-purple-400 font-bold text-3xl">{vlmAmount.toFixed(2)} VLM</p>
                      <p className="text-xs text-gray-500 mt-1">(≈ {purchaseCurrencyAmount.toFixed(6)} {selectedNetworkForPayment?.toUpperCase()})</p>
                    </div>
                    <button onClick={handleBuy} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold py-4 px-10 rounded-lg text-xl transition-all transform hover:scale-105">
                      INVEST
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="hidden lg:flex flex-1 relative">
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '40%' }}>
                <div className="flex flex-col items-center gap-8">
                    {/* Renderujemy komponenty dynamicznie tylko na kliencie, aby uniknąć błędów hydracji */}
                    {isClient && <CountdownTimer />}
                    {isClient && <SandAnimation />}
                </div>
            </div>
        </div>

      </main>

      {/* ===== SEKCJA DOLNA (NOWA WERSJA) ===== */}
      <div className="w-full max-w-5xl px-4 mt-20">
        
        <section className="w-full max-w-4xl text-center mb-16 p-8 bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-lg mx-auto border border-gray-800">
          <h2 className="text-3xl font-semibold mb-8 text-purple-400">Alternatywna Metoda Inwestycji</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 text-purple-400 rounded-full h-12 w-12 flex-shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">1. Wybierz Sieć</h3>
                <p className="text-gray-400 text-sm">Wybierz preferowaną sieć: Ethereum (ETH) lub Solana (SOL).</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 text-purple-400 rounded-full h-12 w-12 flex-shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">2. Wyślij Środki</h3>
                <p className="text-gray-400 text-sm">Wyślij dowolną kwotę (min. $10) na jeden z oficjalnych adresów poniżej.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 text-purple-400 rounded-full h-12 w-12 flex-shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">3. Odbierz Tokeny</h3>
                <p className="text-gray-400 text-sm">Tokeny VLM zostaną automatycznie wysłane na Twój adres po zakończeniu przedsprzedaży.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center flex flex-col items-center border border-gray-800 transition-all duration-300 hover:border-purple-500 hover:shadow-purple-500/20 hover:scale-105">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">Ethereum (ETH)</h3>
            <div className="bg-white p-2 rounded-lg mb-4"><canvas ref={ethQrCanvasRef}></canvas></div>
            <p className="font-mono text-xs text-gray-500 mb-4 break-all">{truncateAddress(ethReceiveAddress)}</p>
            <button onClick={() => copyToClipboard(ethReceiveAddress, 'ETH')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors w-48 h-12 flex items-center justify-center">
              {copiedAddress === 'ETH' ? <CheckIcon /> : 'Kopiuj Adres'}
            </button>
          </div>
          <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center flex flex-col items-center border border-gray-800 transition-all duration-300 hover:border-blue-500 hover:shadow-blue-500/20 hover:scale-105">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Solana (SOL)</h3>
            <div className="bg-white p-2 rounded-lg mb-4"><canvas ref={solQrCanvasRef}></canvas></div>
            <p className="font-mono text-xs text-gray-500 mb-4 break-all">{truncateAddress(solReceiveAddress)}</p>
            <button onClick={() => copyToClipboard(solReceiveAddress, 'SOL')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors w-48 h-12 flex items-center justify-center">
              {copiedAddress === 'SOL' ? <CheckIcon /> : 'Kopiuj Adres'}
            </button>
          </div>
          <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center flex flex-col items-center border border-gray-800 transition-all duration-300 hover:border-cyan-500 hover:shadow-cyan-500/20 hover:scale-105">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">SUI</h3>
            <div className="bg-white p-2 rounded-lg mb-4"><canvas ref={suiQrCanvasRef}></canvas></div>
            <p className="font-mono text-xs text-gray-500 mb-4 break-all">{truncateAddress(suiReceiveAddress)}</p>
            <button onClick={() => copyToClipboard(suiReceiveAddress, 'SUI')} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-full transition-colors w-48 h-12 flex items-center justify-center">
              {copiedAddress === 'SUI' ? <CheckIcon /> : 'Kopiuj Adres'}
            </button>
          </div>
        </section>

        <footer className="w-full text-center py-8 border-t border-gray-800 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Velmere. Wszelkie prawa zastrzeżone.</p>
        </footer>
      </div>
    </div>
  );
}