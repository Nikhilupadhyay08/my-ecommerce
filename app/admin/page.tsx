"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [formData, setFormData] = useState({ name: "", price: "", image: "📦", description: "" });
  const [localProducts, setLocalProducts] = useState<any[]>([]); // Added any[] type
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const saved = JSON.parse(localStorage.getItem("my_local_products") || "[]");
        const combined = [...saved, ...data];
        const unique = combined.filter(
          (v, i, a) => a.findIndex((t: { name: string }) => t.name === v.name) === i
        );
        setLocalProducts(unique);
      } catch {
        const saved = JSON.parse(localStorage.getItem("my_local_products") || "[]");
        setLocalProducts(saved);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newProduct: any = {
      ...formData,
      _id: Date.now().toString(),
      price: Number(formData.price),
    };

    const payload = {
      name: newProduct.name,
      price: newProduct.price,
      image: newProduct.image,
      description: newProduct.description,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("API save failed");
    } catch {
      // Still keep a local copy if the server or DB is unavailable
    }

    const updated = [newProduct, ...localProducts];
    localStorage.setItem("my_local_products", JSON.stringify(updated));
    setLocalProducts(updated);

    alert("Product Add Ho Gaya! ✨");
    setFormData({ name: "", price: "", image: "📦", description: "" });
    setLoading(false);
  };

  const deleteProduct = (id: string) => {
    if(confirm("Kya aap delete karna chahte hain?")) {
      const updated = localProducts.filter((p: any) => p._id !== id);
      localStorage.setItem("my_local_products", JSON.stringify(updated));
      setLocalProducts(updated);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <section style={{ padding: '30px', border: '1px solid #eee', borderRadius: '20px', backgroundColor: 'white' }}>
          <h2 style={{ marginBottom: '20px' }}>Add New Product 🛠️</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Name" required value={formData.name} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input type="number" placeholder="Price" required value={formData.price} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <input type="text" placeholder="Emoji" value={formData.image} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }} onChange={(e) => setFormData({...formData, image: e.target.value})} />
            <textarea placeholder="Description" rows={3} value={formData.description} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc', resize: 'none' }} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <button disabled={loading} style={{ padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? "Saving..." : "Save Product"}
            </button>
          </form>
          <button onClick={() => router.push("/")} style={{ marginTop: '20px', width: '100%', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>← Back to Store</button>
        </section>

        <section>
          <h2 style={{ marginBottom: '20px' }}>Manage Store ({localProducts.length})</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '20px', padding: '10px' }}>
            {localProducts.map((p: any) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '24px' }}>{p.image}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>₹{p.price}</div>
                </div>
                <button onClick={() => deleteProduct(p._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}