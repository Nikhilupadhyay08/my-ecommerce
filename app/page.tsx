"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Database + LocalStorage combined
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        
        // Local Storage se bhi check karein (Airtel DNS fix)
        const savedProducts = JSON.parse(localStorage.getItem("my_local_products") || "[]");
        
        // Dono ko milakar dikhayein
        const combined = [...savedProducts, ...data];
        
        // Duplicate remove karne ke liye logic
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold' }}>
      Nikhil's Store khul raha hai... 🚀
    </div>
  );

  return (
    <main style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px', fontFamily: '"Inter", sans-serif' }}>
      
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

        <button 
          onClick={() => setIsCartOpen(true)}
          style={{ 
            background: '#2563eb', color: 'white', padding: '12px 25px', borderRadius: '15px', 
            fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', gap: '10px'
          }}
        >
          🛒 Cart <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0 8px', borderRadius: '5px' }}>{cart.length}</span>
        </button>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '10px' }}>Naye Deals, Sirf Aapke Liye!</h2>
        <p style={{ color: '#6b7280' }}>Best quality products at unbeatable prices.</p>
      </div>

      {/* Products Grid */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '30px', maxWidth: '1100px', margin: '0 auto' 
      }}>
        {filteredProducts.map((p) => (
          <div 
            key={p._id} 
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
            
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 10px', color: '#111' }}>{p.name}</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>{p.description}</p>
            
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

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <>
          <div onClick={() => setIsCartOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100%', background: 'white', zIndex: 1000, padding: '40px', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
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
                <button onClick={() => router.push("/checkout")} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '20px', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
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