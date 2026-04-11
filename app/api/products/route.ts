import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import getMongoClient from "@/lib/mongodb";

let localProducts = [
  {
    _id: "1",
    name: "Gaming Mouse",
    price: 1200,
    image: "🖱️",
    description: "Demo product",
    category: "Electronics",
  },
  {
    _id: "2",
    name: "Keyboard",
    price: 2500,
    image: "⌨️",
    description: "Demo product",
    category: "Electronics",
  },
];

function idFilter(id: string): { _id: ObjectId } | { _id: string } {
  if (/^[a-fA-F0-9]{24}$/.test(id)) {
    return { _id: new ObjectId(id) };
  }
  return { _id: id };
}

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    const products = await db.collection("products").find({}).toArray();

    if (products.length > 0) return NextResponse.json(products);
    return NextResponse.json(localProducts);
  } catch (e) {
    return NextResponse.json(localProducts);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = { ...body, _id: Date.now().toString() };

    try {
      const client = await getMongoClient();
      const db = client.db("myStore");
      await db.collection("products").insertOne(body);
    } catch (dbError) {
      console.log("DB Busy, saving to local list for now...");
    }

    localProducts.unshift(newProduct);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  localProducts = localProducts.filter((p) => String(p._id) !== id);

  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    await db.collection("products").deleteOne(idFilter(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
