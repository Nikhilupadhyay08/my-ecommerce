import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import getMongoClient from "@/lib/mongodb";
import { getSessionUserFromCookies } from "@/lib/authCookies";

export async function GET() {
  const session = await getSessionUserFromCookies();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.id),
    });
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        id: session.id,
        email: user.email,
        name: typeof user.name === "string" ? user.name : session.name,
      },
    });
  } catch {
    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
      },
    });
  }
}
