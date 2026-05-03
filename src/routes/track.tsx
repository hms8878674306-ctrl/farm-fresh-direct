import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Phone, MessageCircle, MapPin, Package, Check, Truck, Sprout, Home, PackageCheck } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Order — KrishiDirect" }] }),
  component: Track,
});

const STAGES = [
  { key: "confirmed", label: "Order Confirmed", desc: "Farmer notified instantly",   Icon: Check },
  { key: "harvested", label: "Freshly Harvested", desc: "Picked from the farm",       Icon: Sprout },
  { key: "packed",    label: "Packed & Ready",    desc: "Quality-checked, sealed",    Icon: PackageCheck },
  { key: "shipped",   label: "Out for Delivery",  desc: "Rider on the way",           Icon: Truck },
  { key: "delivered", label: "Delivered",          desc: "Enjoy fresh produce!",       Icon: Home },
];

type Order = {
  id: string;
  stage: number;
  status: string;
  etaMinutes: number;
  total: number;
  name?: string;
  addr?: string;
  rider?: { name: string; rating: number; phone: string };
  items?: Array<{ name: string; qty: number; unit: string; price: number }>;
  statusHistory?: Array<{ stage: number; label: string; at: number }>;
};

function fmtClock(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function Track() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [eta, setEta] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOrderId(sessionStorage.getItem("krishi-order-id"));
  }, []);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      setLoading(false);
      if (!snap.exists()) return;
      const v = snap.data() as any;
      setOrder({ id: snap.id, ...v });
      setEta((v.etaMinutes || 0) * 60);
    }, () => setLoading(false));
    return () => unsub();
  }, [orderId]);

  // Live ETA countdown
  useEffect(() => {
    if (!order || order.stage >= STAGES.length - 1) return;
    const i = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(i);
  }, [order?.stage]);

  const stage = order?.stage ?? 0;
  const stageProgress = useMemo(() => ((stage + 1) / STAGES.length) * 100, [stage]);

  const advance = async () => {
    if (!order) return;
    const next = Math.min(STAGES.length - 1, (order.stage ?? 0) + 1);
    const label = STAGES[next].label;
    await updateDoc(doc(db, "orders", order.id), {
      stage: next,
      status: STAGES[next].key,
      etaMinutes: next === STAGES.length - 1 ? 0 : Math.max(2, (order.etaMinutes || 10) - 6),
      statusHistory: arrayUnion({ stage: next, label, at: Date.now() }),
      updatedAt: serverTimestamp(),
    });
  };

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Loading your order…</main>;
  }

  if (!orderId || !order) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="display text-2xl font-bold">No active order</h1>
        <p className="text-muted-foreground mt-2">Place an order to see live tracking here.</p>
        <Link to="/shop" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold">Shop now</Link>
      </main>
    );
  }

  const rider = order.rider || { name: "Suresh Kumar", rating: 4.9, phone: "+91 98765 43210" };
  const delivered = stage >= 3;

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-8 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="display text-4xl font-extrabold">Live Order Tracking</h1>
          <p className="text-muted-foreground mt-1">Order #{order.id.slice(0, 8).toUpperCase()} · ₹{order.total}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fresh/15 text-fresh text-xs font-bold">
          <span className="h-2 w-2 rounded-full bg-fresh animate-pulse" /> Live
        </span>
      </div>

      {/* ETA + Map */}
      <section className="mt-6 rounded-3xl overflow-hidden border border-border bg-card shadow-card">
        <div className="relative h-56 gradient-fresh overflow-hidden">
          <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-90" preserveAspectRatio="none">
            <path d="M 20 160 Q 100 40 200 100 T 380 50" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 6" />
            <circle cx="20" cy="160" r="8" fill="white" />
            <circle cx="380" cy="50" r="8" fill="white" />
            <circle r="6" fill="hsl(var(--harvest, 38 92% 50%))" stroke="white" strokeWidth="2">
              <animateMotion dur="6s" repeatCount="indefinite" path="M 20 160 Q 100 40 200 100 T 380 50" />
            </circle>
          </svg>
          <div className="absolute top-4 left-4 text-primary-foreground">
            <div className="text-xs uppercase tracking-widest opacity-80">{delivered ? "Delivered" : "Arriving in"}</div>
            <div className="display text-5xl font-extrabold">{delivered ? "✓" : fmtClock(eta)}</div>
          </div>
          <div className="absolute bottom-4 right-4 text-primary-foreground/90 text-xs flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {delivered ? "At your door" : `${(eta / 60 * 0.15).toFixed(1)} km away`}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-secondary">
          <div className="h-full gradient-fresh transition-all duration-700" style={{ width: `${stageProgress}%` }} />
        </div>

        <div className="p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full gradient-harvest flex items-center justify-center text-2xl">🛵</div>
          <div className="flex-1">
            <div className="font-bold">{rider.name}</div>
            <div className="text-xs text-muted-foreground">Your delivery partner · ⭐ {rider.rating}</div>
          </div>
          <a href={`tel:${rider.phone}`} aria-label="Call rider" className="h-11 w-11 rounded-full bg-fresh text-fresh-foreground inline-flex items-center justify-center hover:opacity-90"><Phone className="h-5 w-5" /></a>
          <Link to="/chat" aria-label="Chat" className="h-11 w-11 rounded-full bg-secondary inline-flex items-center justify-center hover:bg-muted"><MessageCircle className="h-5 w-5" /></Link>
        </div>
      </section>

      {/* Stages timeline */}
      <section className="mt-6 rounded-3xl bg-card border border-border p-6">
        <h2 className="display text-xl font-bold mb-5">Delivery Timeline</h2>
        <div className="space-y-1">
          {STAGES.map((s, i) => {
            const done = i <= stage;
            const active = i === stage && !delivered;
            const ts = order.statusHistory?.find(h => h.stage === i)?.at;
            const Icon = s.Icon;
            return (
              <div key={s.key} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${active ? "ring-4 ring-primary/25 animate-pulse" : ""}`}>
                    {done ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                  </div>
                  {i < STAGES.length - 1 && <div className={`w-0.5 flex-1 min-h-12 ${i < stage ? "bg-primary" : "bg-border"}`} />}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`font-bold ${done ? "" : "text-muted-foreground"}`}>{s.label}</div>
                    {ts && <div className="text-[10px] text-muted-foreground tabular-nums">{new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {!delivered && (
          <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-border">
            <button onClick={advance} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary-glow font-semibold">
              Simulate next stage →
            </button>
            <span className="text-[11px] text-muted-foreground self-center">Demo: pushes a real Firestore update — all open tabs sync live.</span>
          </div>
        )}
      </section>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <section className="mt-6 rounded-3xl bg-card border border-border p-6">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> In this order</h2>
          <div className="grid gap-2">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                <span className="font-medium">{it.name} <span className="text-muted-foreground">× {it.qty} {it.unit}</span></span>
                <span className="font-bold">₹{it.qty * it.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
