// src/app/api/get-user-data/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("velmere_db"); // Upewnij się, że nazwa bazy jest taka sama jak w API do zapisu
    const transactions = db.collection("transactions");

    // Znajdź wszystkie transakcje dla danego adresu portfela
    const userTransactions = await transactions.find({ walletAddress: walletAddress }).toArray();

    // Zsumuj tokeny (`tokenAmount`) ze wszystkich znalezionych transakcji
    const totalTokens = userTransactions.reduce((sum, tx) => sum + tx.tokenAmount, 0);

    return NextResponse.json({ totalTokenBalance: totalTokens });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}