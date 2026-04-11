"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mergeProductLists } from "@/lib/mergeProductLists";
import { productCategory } from "@/lib/categories";
import { idToString } from "@/lib/idToString";
import { STORE_CART_KEY } from "@/lib/cartStorage";

const PRODUCTS_PER_PAGE = 12;

export default function Home() {
const [products, setProducts] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const categoryChips = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(productCategory(p)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      /* ignore */
    }
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem(STORE_CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    // Database + LocalStorage combined
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        
        // Local Storage se bhi check karein (Airtel DNS fix)
        const savedProducts = JSON.parse(localStorage.getItem("my_local_products") || "[]");
        
        const unique = mergeProductLists(savedProducts, data) as any[];
        setProducts(unique);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const name = (p.name || "").toLowerCase();
    const catOk =
      categoryFilter === "all" || productCategory(p) === categoryFilter;
    return catOk && name.includes(q);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold' }}>
      Nikhil's Store khul raha hai... 🚀
    </div>
  );

  return (
    <main
      className="flex flex-1 flex-col bg-gray-50 px-4 py-5 sm:px-5 sm:py-6"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      
      {/* Navbar Style Header */}
      <nav style={{ 
        maxWidth: '1100px', margin: '0 auto 40px', padding: '20px', backgroundColor: 'white', 
        borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111', margin: 0, letterSpacing: '-1px' }}>
          NIKHIL <span style={{ color: '#2563eb' }}>STORE</span>
        </h1>
        
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search products..."
            style={{ 
              width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #e5e7eb', 
              outline: 'none', transition: '0.3s', backgroundColor: '#f3f4f6'
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <Link
            href="/admin"
            style={{
              padding: "12px 18px",
              borderRadius: "15px",
              border: "1px solid #e5e7eb",
              fontWeight: "600",
              color: "#374151",
              textDecoration: "none",
              background: "white",
            }}
          >
            Admin
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "12px 25px",
              borderRadius: "15px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              display: "flex",
              gap: "10px",
            }}
          >
            🛒 Cart{" "}
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "0 8px",
                borderRadius: "5px",
              }}
            >
              {cart.length}
            </span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: "800",
            marginBottom: "10px",
          }}
        >
          Naye Deals, Sirf Aapke Liye!
        </h2>
        <p style={{ color: "#6b7280" }}>
          Best quality products at unbeatable prices.
        </p>
      </div>

      {/* Categories */}
      <div className="mx-auto mb-8 flex max-w-[1100px] flex-col gap-3">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
          Categories
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              categoryFilter === "all"
                ? "bg-gray-900 text-white shadow"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {categoryChips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                categoryFilter === c
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "30px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {pageItems.map((p, idx) => (
          <div
            key={idToString(p._id) || `p-${idx}`}
            className="product-card"
            style={{ 
              border: 'none', padding: '20px', borderRadius: '24px', textAlign: 'center', 
              backgroundColor: 'white', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ 
              fontSize: '80px', background: '#f3f4f6', borderRadius: '20px', 
              padding: '30px', marginBottom: '20px' 
            }}>{p.image || '📦'}</div>
            
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-blue-600">
              {productCategory(p)}
            </p>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                margin: "0 0 10px",
                color: "#111",
              }}
            >
              {p.name}
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {p.description}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#111' }}>₹{p.price}</span>
              <button 
                onClick={() => addToCart(p)}
                style={{ 
                  background: '#000', color: '#fff', border: 'none', padding: '10px 20px', 
                  borderRadius: '12px', cursor: 'pointer', fontWeight: '600' 
                }}
              >
                Add +
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length > PRODUCTS_PER_PAGE && (
        <div className="mx-auto mt-10 flex max-w-[1100px] flex-col items-center justify-center gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages} · {filteredProducts.length} products
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <>
          <div onClick={() => setIsCartOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
          <div
            className="fixed right-0 top-0 z-[1000] flex h-full w-full max-w-md flex-col bg-white p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] sm:p-10"
            style={{ boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>My Bag 🛍️</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ border: 'none', background: '#f3f4f6', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>Close</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '100px', color: '#9ca3af' }}>Bag khali hai!</div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '15px' }}>
                    <div style={{ fontSize: '30px' }}>{item.image}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700' }}>{item.name}</div>
                      <div style={{ color: '#6b7280' }}>₹{item.price}</div>
                    </div>
                    <button onClick={() => removeFromCart(index)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '800', marginBottom: '30px' }}>
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '20px', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Continue to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Card Hover Style (Internal CSS) */}
      <style jsx global>{`
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </main>
  );
}