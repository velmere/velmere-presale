// src/app/api/get-progress/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

// This option prevents Vercel from caching the response
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("velmere_db");
    const transactions = db.collection("transactions");
    
    // Use an aggregation pipeline to sum the usdAmount field
    const aggregation = await transactions.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$usdAmount" }
        }
      }
    ]).toArray();
    
    // Add the initial amount of 70,000 USD
    const baseAmount = 70000;
    const totalRaised = (aggregation.length > 0 ? aggregation[0].total : 0) + baseAmount;
    
    return NextResponse.json({ totalRaisedUSD: totalRaised });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}