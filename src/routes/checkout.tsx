import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart, cartTotal, cart } from "@/lib/cart-store";
import { useState } from "react";
import { Banknote, CreditCard, Wallet, MapPin, Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — KrishiDirect" }] }),
  component: Checkout,
});

function Checkout() {
  const s = useCart();
  const total = cartTotal(s);
  const nav = useNavigate();
  const [method, setMethod] = useState<"cod" | "upi" | "card">("cod");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !addr) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("krishi-order", JSON.stringify({ items: s.items, total, method, name, phone, addr, placedAt: Date.now() }));
    }
    cart.clear();
    nav({ to: "/track" });
  };

  if (s.items.length === 0 && typeof window !== "undefined") {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-6xl mb-4">🧺</div>
        <h1 className="display text-2xl font-bold">Your basket is empty</h1>
        <button onClick={() => nav({ to: "/shop" })} className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold">Shop now</button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-8 py-10">
      <h1 className="display text-4xl font-extrabold mb-8">Checkout</h1>

      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <section className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery Address</h2>
            <div className="grid gap-3">
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
              <input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" className="h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
              <textarea required value={addr} onChange={e=>setAddr(e.target.value)} placeholder="Full address with pincode" rows={3} className="px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "cod" as const, Icon: Banknote, label: "Cash on Delivery", desc: "Pay when you receive" },
                { id: "upi" as const, Icon: Wallet, label: "UPI", desc: "GPay, PhonePe, Paytm" },
                { id: "card" as const, Icon: CreditCard, label: "Card", desc: "Debit / Credit" },
              ].map(({ id, Icon, label, desc }) => (
                <button key={id} type="button" onClick={() => setMethod(id)}
                  className={`relative text-left rounded-xl border-2 p-4 transition ${method === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  {method === id && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                  <Icon className="h-6 w-6 text-primary mb-2" />
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-2xl bg-card border border-border p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {s.items.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-3 text-sm">
                <img src={product.image} className="h-12 w-12 rounded-lg object-cover" alt={product.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{qty} × ₹{product.price}</div>
                </div>
                <div className="font-bold">₹{qty * product.price}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{total}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-fresh font-semibold">FREE</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span>Total</span><span className="text-primary">₹{total}</span></div>
          </div>
          <button type="submit" className="mt-5 w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:bg-primary-glow transition">
            Place Order {method === "cod" && "(COD)"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-3">By placing the order you agree to fair-farmer terms.</p>
        </aside>
      </form>
    </main>
  );
}
