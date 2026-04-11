"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { mergeProductLists } from "@/lib/mergeProductLists";
import { idToString } from "@/lib/idToString";
import {
  PRODUCT_CATEGORY_OPTIONS,
  productCategory,
} from "@/lib/categories";

type FormState = {
  name: string;
  price: string;
  image: string;
  description: string;
  category: string;
};

const emptyForm = (): FormState => ({
  name: "",
  price: "",
  image: "📦",
  description: "",
  category: PRODUCT_CATEGORY_OPTIONS[0],
});

export default function AdminPage() {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      const saved = JSON.parse(
        localStorage.getItem("my_local_products") || "[]"
      );
      setProducts(mergeProductLists(saved, data) as any[]);
    } catch {
      const saved = JSON.parse(
        localStorage.getItem("my_local_products") || "[]"
      );
      setProducts(saved);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newProduct: any = {
      name: formData.name.trim(),
      price: Number(formData.price),
      image: formData.image,
      description: formData.description.trim(),
      category: formData.category,
      _id: Date.now().toString(),
    };

    const payload = {
      name: newProduct.name,
      price: newProduct.price,
      image: newProduct.image,
      description: newProduct.description,
      category: newProduct.category,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("API save failed");
    } catch {
      // keep local copy below
    }

    const saved = JSON.parse(
      localStorage.getItem("my_local_products") || "[]"
    );
    const updated = [newProduct, ...saved];
    localStorage.setItem("my_local_products", JSON.stringify(updated));

    await reload();
    setFormData(emptyForm());
    alert("Product saved.");
    setLoading(false);
  };

  const deleteProduct = async (p: any) => {
    const sid = idToString(p._id);
    if (!sid) return;
    if (!confirm(`Remove “${p.name}” from the store?`)) return;

    setDeletingId(sid);
    try {
      await fetch(`/api/products?id=${encodeURIComponent(sid)}`, {
        method: "DELETE",
      });
    } catch {
      // still refresh local state
    }

    const saved = JSON.parse(
      localStorage.getItem("my_local_products") || "[]"
    );
    localStorage.setItem(
      "my_local_products",
      JSON.stringify(saved.filter((x: any) => idToString(x._id) !== sid))
    );
    await reload();
    setDeletingId(null);
  };

  return (
    <main className="mx-auto min-h-0 flex-1 max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Admin panel
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Add or remove products. Changes sync to the database when{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">MONGODB_URI</code>{" "}
            is configured.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            ← Store
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-gray-900">Add product</h2>
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
                placeholder="Product name"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
                >
                  {PRODUCT_CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                Image (emoji)
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
                placeholder="Short description"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save product"}
            </button>
          </form>
        </section>

        <section className="flex min-h-0 flex-col">
          <h2 className="text-lg font-bold text-gray-900">
            Inventory ({products.length})
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Remove items from the catalog. Deletes apply on the server when the
            database is connected.
          </p>
          <div className="mt-4 flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-100 overflow-y-auto">
              {products.length === 0 ? (
                <li className="px-4 py-12 text-center text-sm text-gray-500">
                  No products yet. Add one on the left.
                </li>
              ) : (
                products.map((p: any) => {
                  const sid = idToString(p._id);
                  return (
                    <li
                      key={sid || p.name}
                      className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5"
                    >
                      <span className="text-2xl sm:text-3xl" aria-hidden>
                        {p.image || "📦"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 sm:text-sm">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {productCategory(p)}
                          </span>
                          <span className="ml-2">₹{p.price}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p)}
                        disabled={deletingId === sid}
                        className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 sm:text-sm"
                      >
                        {deletingId === sid ? "…" : "Remove"}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
