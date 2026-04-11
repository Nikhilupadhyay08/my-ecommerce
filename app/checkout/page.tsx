"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [address, setAddress] = useState({ street: "", city: "", phone: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Yahan hum sirf ek fake payment delay dikhayenge
    setTimeout(() => {
      alert("Order Successful! Aapka saman jald hi nikal jayega. 🎉");
      setIsProcessing(false);
      router.push("/"); // Wapas home par
    }, 2000);
  };

  return (
    <main
      className="mx-auto my-8 flex-1 px-4"
      style={{
        maxWidth: "500px",
        padding: "30px",
        border: "1px solid #eee",
        borderRadius: "20px",
        textAlign: "center",
      }}
    >
      <h1>Shipping Details 🚚</h1>
      <p style={{ color: '#666' }}>Bas aakhri kadam! Apna pata bhariye.</p>

      <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="text" placeholder="Ghar ka Pata (Street Address)" required
          style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
          onChange={(e) => setAddress({...address, street: e.target.value})}
        />
        <input 
          type="text" placeholder="Shehar (City)" required
          style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
          onChange={(e) => setAddress({...address, city: e.target.value})}
        />
        <input 
          type="number" placeholder="Mobile Number" required
          style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
          onChange={(e) => setAddress({...address, phone: e.target.value})}
        />

        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', margin: '10px 0' }}>
          <p>Payment Method: **Cash on Delivery** 💵</p>
        </div>

        <button 
          disabled={isProcessing}
          style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {isProcessing ? "Processing Order..." : "Place Order Now"}
        </button>
      </form>
    </main>
  );
}