// src/app/api/prices/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Adresy API Binance dla cen USDT (możesz zmienić na EUR lub inne stablecoiny)
    const binanceApiUrlETH = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT';
    const binanceApiUrlSOL = 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT';
    // SUI nie jest tak powszechne, ale możesz sprawdzić inne giełdy lub użyć średniej
    const binanceApiUrlSUI = 'https://api.binance.com/api/v3/ticker/price?symbol=SUIUSDT'; // Sprawdź, czy SUIUSDT jest dostępne na Binance

    const [resETH, resSOL, resSUI] = await Promise.all([
      fetch(binanceApiUrlETH),
      fetch(binanceApiUrlSOL),
      fetch(binanceApiUrlSUI).catch(() => null) // Dodano catch, jeśli SUIUSDT nie jest dostępne
    ]);

    const dataETH = await resETH.json();
    const dataSOL = await resSOL.json();
    const dataSUI = resSUI ? await resSUI.json() : { price: "0" }; // Jeśli SUI nie działa, ustaw 0

    const ethPrice = parseFloat(dataETH.price);
    const solPrice = parseFloat(dataSOL.price);
    const suiPrice = parseFloat(dataSUI.price); // Może być 0, jeśli nie znaleziono SUI

    if (isNaN(ethPrice) || isNaN(solPrice)) {
        throw new Error('Failed to parse price data from Binance.');
    }

    return NextResponse.json({
      ETH_USD: ethPrice,
      SOL_USD: solPrice,
      SUI_USD: suiPrice || 0, // Zapewnij, że jest to liczba
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Error fetching prices from Binance:', error);
    // W przypadku błędu zwracamy domyślne ceny, aby strona nadal działała
    return NextResponse.json({
      ETH_USD: 3500,
      SOL_USD: 150,
      SUI_USD: 1.2,
      timestamp: Date.now(),
      error: 'Failed to fetch live prices, using default values.',
    }, { status: 500 });
  }
}