"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  // Form data ke liye states
  const [formData, setFormData] = useState({ name: "", price: "", image: "📦", description: "" });
  const [localProducts, setLocalProducts] = useState<any[]>([]); // <any[]> add kiya
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("my_local_products") || "[]");
    setLocalProducts(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false); // Build fail na ho isliye simple rakha hai

    const newProduct = { 
      ...formData, 
      _id: Date.now().toString(), 
      price: Number(formData.price) 
    };
    
    const updated = [newProduct, ...localProducts];
    localStorage.setItem("my_local_products", JSON.stringify(updated));
    setLocalProducts(updated);
    
    alert("Product Add Ho Gaya! ✨");
    setFormData({ name: "", price: "", image: "📦", description: "" });
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
          <h2>Add New Product 🛠️</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Name" required value={formData.name} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input type="number" placeholder="Price" required value={formData.price} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <input type="text" placeholder="Emoji" value={formData.image} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }} onChange={(e) => setFormData({...formData, image: e.target.value})} />
            <textarea placeholder="Description" rows={3} value={formData.description} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <button style={{ padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Save Product</button>
          </form>
        </section>

        <section>
          <h2>Manage Store</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {localProducts.map((p: any) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
                <span>{p.image}</span>
                <div style={{ flex: 1 }}><b>{p.name}</b><br/>₹{p.price}</div>
                <button onClick={() => deleteProduct(p._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}