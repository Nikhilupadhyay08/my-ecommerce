import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import getMongoClient from "@/lib/mongodb";
import { getSessionUserFromCookies } from "@/lib/authCookies";
import { sendMailWithSettings } from "@/lib/mailer";
import { getSmtpSettings } from "@/lib/siteSettings";

type LineItem = {
  name?: string;
  price?: number;
  qty?: number;
  image?: string;
};

function orderEmailHtml(orderId: string, items: { name: string; price: number; qty: number }[], total: number, address: { street: string; city: string; phone: string }) {
  const rows = items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.name)}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`
    )
    .join("");
  return `
  <h1 style="font-family:sans-serif">Thank you for your order</h1>
  <p style="font-family:sans-serif;color:#444">Order ID: <strong>${escapeHtml(orderId)}</strong></p>
  <p style="font-family:sans-serif;color:#444">Payment: Cash on delivery</p>
  <h2 style="font-family:sans-serif">Ship to</h2>
  <p style="font-family:sans-serif;color:#444">${escapeHtml(address.street)}<br/>${escapeHtml(address.city)}<br/>Phone: ${escapeHtml(address.phone)}</p>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif">
    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Line</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-family:sans-serif;font-size:18px"><strong>Total: ₹${total}</strong></p>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const user = await getSessionUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    address?: { street?: string; city?: string; phone?: string };
    items?: LineItem[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const addr = body.address;
  const items = body.items;
  if (
    !addr ||
    typeof addr.street !== "string" ||
    typeof addr.city !== "string" ||
    typeof addr.phone !== "string"
  ) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const normalized = items
    .map((i) => ({
      name: String(i.name || "").trim(),
      price: Number(i.price) || 0,
      qty: Math.max(1, Math.floor(Number(i.qty) || 1)),
      image: i.image != null ? String(i.image) : "",
    }))
    .filter((i) => i.name.length > 0);

  if (!normalized.length) {
    return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
  }

  const total = normalized.reduce((s, i) => s + i.price * i.qty, 0);
  const address = {
    street: addr.street.trim(),
    city: addr.city.trim(),
    phone: String(addr.phone).trim(),
  };

  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    const ins = await db.collection("orders").insertOne({
      userId: new ObjectId(user.id),
      email: user.email,
      name: user.name,
      items: normalized,
      address,
      total,
      payment: "COD",
      status: "pending",
      createdAt: new Date(),
    });

    const orderId = ins.insertedId.toString();

    const smtp = await getSmtpSettings();
    if (smtp?.from && user.email) {
      const html = orderEmailHtml(
        orderId,
        normalized.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
        total,
        address
      );
      try {
        await sendMailWithSettings(smtp, {
          to: user.email,
          subject: `Nikhil Store — order ${orderId}`,
          html,
        });
      } catch (e) {
        console.error("Order confirmation email failed:", e);
      }
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not place order. Check database connection." },
      { status: 500 }
    );
  }
}
