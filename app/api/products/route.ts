import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Ye list temporary products store karegi jab tak DB connect nahi hota
let localProducts = [
  { _id: "1", name: "Gaming Mouse", price: 1200, image: "🖱️", description: "Demo product" },
  { _id: "2", name: "Keyboard", price: 2500, image: "⌨️", description: "Demo product" }
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("myStore"); 
    const products = await db.collection("products").find({}).toArray();
    
    if (products.length > 0) return NextResponse.json(products);
    return NextResponse.json(localProducts);
  } catch (e) {
    // Agar DB fail ho, toh local list bhej do
    return NextResponse.json(localProducts);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = { ...body, _id: Date.now().toString() };
    
    // 1. Database mein save karne ki koshish
    try {
      const client = await clientPromise;
      const db = client.db("myStore");
      await db.collection("products").insertOne(body);
    } catch (dbError) {
      console.log("DB Busy, saving to local list for now...");
    }

    // 2. Local list mein add karo (Taaki turant screen par dikhe)
    localProducts.unshift(newProduct); 

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}