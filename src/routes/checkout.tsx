import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart, cartTotal, cart, effectivePrice, cartAvgDistance } from "@/lib/cart-store";
import { useDeals, deals as dealsStore } from "@/lib/deals-store";
import { deliveryFee, FREE_DELIVERY_THRESHOLD, distanceFromPincode } from "@/lib/delivery";
import { useMemo, useState } from "react";
import { Banknote, CreditCard, Wallet, MapPin, Check, Sparkles, Truck } from "lucide-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — KrishiDirect" }] }),
  component: Checkout,
});

function Checkout() {
  const s = useCart();
  useDeals();
  const { t } = useLanguage();
  const subtotal = cartTotal(s);
  const nav = useNavigate();
  const { user } = useAuth();
  const [method, setMethod] = useState<"cod" | "upi" | "card">("cod");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);

  const distance = useMemo(() => {
    if (pincode.length >= 6) return distanceFromPincode(pincode);
    return cartAvgDistance(s);
  }, [pincode, s]);
  const fee = deliveryFee(subtotal, distance);
  const savings = s.items.reduce((sum, i) => {
    const list = i.product.price * i.qty;
    return sum + Math.max(0, list - effectivePrice(i.product) * i.qty);
  }, 0);
  const grand = subtotal + fee;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !addr) return;
    setBusy(true);
    const order = {
      items: s.items.map(({ product, qty }) => ({
        productId: product.id,
        name: product.name,
        listPrice: product.price,
        price: effectivePrice(product),
        negotiated: effectivePrice(product) !== product.price,
        qty,
        unit: product.unit,
      })),
      subtotal,
      deliveryFee: fee,
      distanceKm: distance,
      total: grand,
      savings,
      method, name, phone, addr, pincode,
      userId: user?.uid || null,
      userEmail: user?.email || null,
      status: "confirmed",
      stage: 0,
      etaMinutes: Math.max(20, Math.round(20 + distance * 2)),
      rider: { name: "Suresh Kumar", rating: 4.9, phone: "+91 98765 43210" },
      statusHistory: [
        { stage: 0, label: "Order Confirmed", at: Date.now() },
      ],
      createdAt: serverTimestamp(),
    };
    try {
      const ref = await addDoc(collection(db, "orders"), order);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("krishi-order-id", ref.id);
      }
      // Clear deals once consumed
      s.items.forEach(({ product }) => dealsStore.clear(product.id));
      cart.clear();
      nav({ to: "/track" });
    } catch (err: any) {
      alert(t.couldNotPlaceOrder + " " + (err?.message || err));
      setBusy(false);
    }
  };

  if (s.items.length === 0 && typeof window !== "undefined") {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-6xl mb-4">🧺</div>
        <h1 className="display text-2xl font-bold">{t.emptyBasketTitle}</h1>
        <button onClick={() => nav({ to: "/shop", search: { q: "" } })} className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold">{t.shopNow}</button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-8 py-10">
      <h1 className="display text-4xl font-extrabold mb-8">{t.checkoutTitle}</h1>

      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <section className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> {t.deliveryAddress}</h2>
            <div className="grid gap-3">
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder={t.fullName} className="h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
              <div className="grid grid-cols-2 gap-3">
                <input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t.phoneNumber} className="h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
                <input value={pincode} onChange={e=>setPincode(e.target.value)} placeholder={t.pincode} maxLength={6} className="h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <textarea required value={addr} onChange={e=>setAddr(e.target.value)} placeholder={t.fullAddress} rows={3} className="px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" /> {t.estimatedDistance} <b>{distance.toFixed(1)} {t.km}</b> · {fee === 0 ? <span className="text-fresh font-semibold">{t.freeDelivery}</span> : <>{t.deliveryFeeLabel} <b>₹{fee}</b></>}
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-bold text-lg mb-4">{t.paymentMethod}</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "cod" as const, Icon: Banknote, label: t.payCod, desc: t.payCodDesc },
                { id: "upi" as const, Icon: Wallet, label: t.payUpi, desc: t.payUpiDesc },
                { id: "card" as const, Icon: CreditCard, label: t.payCard, desc: t.payCardDesc },
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
          <h2 className="font-bold text-lg mb-4">{t.orderSummary}</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {s.items.map(({ product, qty }) => {
              const unit = effectivePrice(product);
              const negotiated = unit !== product.price;
              return (
                <div key={product.id} className="flex gap-3 text-sm">
                  <img src={product.image} className="h-12 w-12 rounded-lg object-cover" alt={product.name} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate flex items-center gap-1.5">
                      {product.name}
                      {negotiated && <span className="inline-flex items-center text-[9px] font-bold uppercase text-fresh"><Sparkles className="h-2.5 w-2.5 mr-0.5" />{t.deal}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {qty} × {negotiated ? <><span className="line-through mr-1">₹{product.price}</span><span className="text-fresh font-semibold">₹{unit}</span></> : <>₹{unit}</>}
                    </div>
                  </div>
                  <div className="font-bold">₹{qty * unit}</div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t.subtotal}</span><span>₹{subtotal}</span></div>
            {savings > 0 && (
              <div className="flex justify-between"><span className="text-muted-foreground">{t.negotiationSavings}</span><span className="text-fresh font-semibold">−₹{savings}</span></div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.deliveryFeeLabel} <span className="text-[10px]">({distance.toFixed(1)} {t.km})</span></span>
              {fee === 0 ? <span className="text-fresh font-semibold">{t.freeDelivery}</span> : <span>₹{fee}</span>}
            </div>
            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <div className="text-[11px] text-muted-foreground">{t.addForFreeDelivery.replace("{amount}", String(FREE_DELIVERY_THRESHOLD - subtotal))}</div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span>{t.total}</span><span className="text-primary">₹{grand}</span></div>
          </div>
          <button type="submit" disabled={busy} className="mt-5 w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:bg-primary-glow transition disabled:opacity-60">
            {busy ? t.placingOrder : <>{t.placeOrder} {method === "cod" && "(COD)"}</>}
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-3">{t.fairFarmerTerms}</p>
        </aside>
      </form>
    </main>
  );
}
