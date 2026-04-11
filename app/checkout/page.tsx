"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STORE_CART_KEY } from "@/lib/cartStorage";

type CartLine = { name: string; price: number; image?: string; qty?: number };

export default function CheckoutPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [address, setAddress] = useState({ street: "", city: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user?.email) setUserEmail(data.user.email);
      } catch {
        /* ignore */
      }
    })();
    try {
      const raw = localStorage.getItem(STORE_CART_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setCart(Array.isArray(p) ? p : []);
      }
    } catch {
      setCart([]);
    }
  }, []);

  const subtotal = cart.reduce(
    (s, i) => s + Number(i.price) * Math.max(1, Number(i.qty) || 1),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cart.length) {
      setError("Your cart is empty. Add products from the store.");
      return;
    }
    setIsProcessing(true);
    try {
      const items = cart.map((i) => ({
        name: i.name,
        price: Number(i.price),
        qty: Math.max(1, Math.floor(Number(i.qty) || 1)),
        image: i.image,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            street: address.street,
            city: address.city,
            phone: address.phone,
          },
          items,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Order failed");
        setIsProcessing(false);
        return;
      }
      try {
        localStorage.setItem(STORE_CART_KEY, JSON.stringify([]));
      } catch {
        /* ignore */
      }
      router.push(`/order/success?id=${encodeURIComponent(data.orderId)}`);
    } catch {
      setError("Network error");
    }
    setIsProcessing(false);
  };

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-extrabold text-gray-900">
          Checkout
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Cash on delivery. Signed in as{" "}
          <span className="font-semibold text-gray-900">
            {userEmail || "…"}
          </span>
        </p>

        <section className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h2 className="text-sm font-bold text-gray-800">Your cart</h2>
          {cart.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              Nothing here.{" "}
              <Link href="/" className="font-medium text-blue-600 hover:underline">
                Continue shopping
              </Link>
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-200 text-sm">
              {cart.map((item, idx) => (
                <li key={idx} className="flex justify-between gap-2 py-2">
                  <span className="text-gray-800">
                    {item.image ? `${item.image} ` : ""}
                    {item.name} × {Math.max(1, Number(item.qty) || 1)}
                  </span>
                  <span className="shrink-0 font-medium text-gray-900">
                    ₹
                    {Number(item.price) *
                      Math.max(1, Math.floor(Number(item.qty) || 1))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 border-t border-gray-200 pt-3 text-right text-base font-bold text-gray-900">
            Subtotal ₹{subtotal}
          </p>
        </section>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <h2 className="text-sm font-bold text-gray-800">Shipping</h2>
          <input
            type="text"
            placeholder="Street address"
            required
            value={address.street}
            onChange={(e) =>
              setAddress({ ...address, street: e.target.value })
            }
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
          <input
            type="tel"
            placeholder="Mobile number"
            required
            value={address.phone}
            onChange={(e) =>
              setAddress({ ...address, phone: e.target.value })
            }
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />

          <div className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-700">
            Payment: <strong>Cash on delivery</strong>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isProcessing || !cart.length}
            className="rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Placing order…" : "Place order"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-600 hover:text-blue-600"
        >
          ← Back to store
        </Link>
      </div>
    </main>
  );
}
