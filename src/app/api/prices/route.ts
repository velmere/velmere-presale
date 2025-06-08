// src/app/api/prices/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const binanceApiUrlETH = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT';
    const binanceApiUrlSOL = 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT';
    const binanceApiUrlSUI = 'https://api.binance.com/api/v3/ticker/price?symbol=SUIUSDT';

    const [resETH, resSOL, resSUI] = await Promise.allSettled([ // Zmieniono na Promise.allSettled
      fetch(binanceApiUrlETH),
      fetch(binanceApiUrlSOL),
      fetch(binanceApiUrlSUI)
    ]);

    let ethPrice = 3500; // Domyślne wartości
    let solPrice = 150;
    let suiPrice = 1.2;

    // Przetwarzanie odpowiedzi dla ETH
    if (resETH.status === 'fulfilled' && resETH.value.ok) {
      const dataETH = await resETH.value.json();
      if (dataETH.price) ethPrice = parseFloat(dataETH.price);
    } else {
      console.warn('Failed to fetch ETH price or response not OK. Using default. Status:', resETH.status);
      if (resETH.status === 'rejected') console.error('ETH fetch error:', resETH.reason);
    }

    // Przetwarzanie odpowiedzi dla SOL
    if (resSOL.status === 'fulfilled' && resSOL.value.ok) {
      const dataSOL = await resSOL.value.json();
      if (dataSOL.price) solPrice = parseFloat(dataSOL.price);
    } else {
      console.warn('Failed to fetch SOL price or response not OK. Using default. Status:', resSOL.status);
      if (resSOL.status === 'rejected') console.error('SOL fetch error:', resSOL.reason);
    }

    // Przetwarzanie odpowiedzi dla SUI
    if (resSUI.status === 'fulfilled' && resSUI.value.ok) {
      const dataSUI = await resSUI.value.json();
      if (dataSUI.price) suiPrice = parseFloat(dataSUI.price);
    } else {
      console.warn('Failed to fetch SUI price or response not OK. Using default. Status:', resSUI.status);
      if (resSUI.status === 'rejected') console.error('SUI fetch error:', resSUI.reason);
    }

    // Finalna walidacja, aby upewnić się, że ceny są liczbami
    ethPrice = isNaN(ethPrice) ? 3500 : ethPrice;
    solPrice = isNaN(solPrice) ? 150 : solPrice;
    suiPrice = isNaN(suiPrice) ? 1.2 : suiPrice;

    return NextResponse.json({
      ETH_USD: ethPrice,
      SOL_USD: solPrice,
      SUI_USD: suiPrice,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Unhandled error in /api/prices:', error);
    // Zwracamy status 500, ale z domyślnymi danymi, aby strona mogła działać.
    return NextResponse.json({
      ETH_USD: 3500,
      SOL_USD: 150,
      SUI_USD: 1.2,
      timestamp: Date.now(),
      error: 'Failed to fetch live prices, using default values due to unhandled error.',
    }, { status: 500 });
  }
}