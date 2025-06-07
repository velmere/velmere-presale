// src/app/api/process-transaction/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb'; // Importujemy nasze połączenie z bazą

export async function POST(request: Request) {
  try {
    // Dodajemy odbiór usdAmount, który wysyła frontend
    const { walletAddress, txHash, network, amount, tokenAmount, usdAmount } = await request.json();

    // Prosta walidacja, czy otrzymaliśmy kluczowe dane
    if (!walletAddress || !txHash || !usdAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("velmere_db"); // Nazwa Twojej bazy danych
    const transactions = db.collection("transactions");

    // Tworzymy obiekt, który zostanie zapisany w bazie
    const newTransaction = {
      walletAddress,
      txHash,
      network,
      cryptoAmount: amount,
      tokenAmount,
      usdAmount,
      createdAt: new Date(),
    };

    // Zapisujemy nowy dokument w kolekcji "transactions"
    await transactions.insertOne(newTransaction);

    console.log('Zapisano nową transakcję do bazy danych:', newTransaction);

    return NextResponse.json({ message: 'Transaction recorded successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Błąd zapisu do bazy danych:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}