import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, MessageCircle, MapPin, Package, Check } from "lucide-react";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Order — KrishiDirect" }] }),
  component: Track,
});

const STAGES = [
  { key: "confirmed", label: "Order Confirmed", desc: "Farmer notified" },
  { key: "harvested", label: "Freshly Harvested", desc: "Picked from farm" },
  { key: "shipped", label: "Out for Delivery", desc: "Rider on the way" },
  { key: "delivered", label: "Delivered", desc: "Enjoy fresh!" },
];

function Track() {
  const [stage, setStage] = useState(2); // shipped
  const [eta, setEta] = useState(18 * 60);
  useEffect(() => {
    const i = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(i);
  }, []);
  const mins = Math.floor(eta / 60);
  const secs = (eta % 60).toString().padStart(2, "0");

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-8 py-10">
      <h1 className="display text-4xl font-extrabold">Live Order Tracking</h1>
      <p className="text-muted-foreground mt-1">Order #KD-{Math.floor(Math.random() * 9000 + 1000)}</p>

      {/* ETA + Map */}
      <section className="mt-6 rounded-3xl overflow-hidden border border-border bg-card shadow-card">
        <div className="relative h-56 gradient-fresh overflow-hidden">
          <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-90" preserveAspectRatio="none">
            <path d="M 20 160 Q 100 40 200 100 T 380 50" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-route" />
            <circle cx="20" cy="160" r="8" fill="white" />
            <circle cx="380" cy="50" r="8" fill="white" />
          </svg>
          <div className="absolute top-4 left-4 text-primary-foreground">
            <div className="text-xs uppercase tracking-widest opacity-80">Arriving in</div>
            <div className="display text-5xl font-extrabold">{mins}:{secs}</div>
          </div>
          <div className="absolute bottom-4 right-4 text-primary-foreground/90 text-xs flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> 2.4 km away
          </div>
        </div>

        <div className="p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full gradient-harvest flex items-center justify-center text-2xl">🛵</div>
          <div className="flex-1">
            <div className="font-bold">Suresh Kumar</div>
            <div className="text-xs text-muted-foreground">Your delivery partner · ⭐ 4.9</div>
          </div>
          <a href="tel:" className="h-11 w-11 rounded-full bg-fresh text-fresh-foreground inline-flex items-center justify-center"><Phone className="h-5 w-5" /></a>
          <button className="h-11 w-11 rounded-full bg-secondary inline-flex items-center justify-center"><MessageCircle className="h-5 w-5" /></button>
        </div>
      </section>

      {/* Stages */}
      <section className="mt-6 rounded-3xl bg-card border border-border p-6">
        <div className="space-y-5">
          {STAGES.map((s, i) => {
            const done = i <= stage;
            const active = i === stage;
            return (
              <div key={s.key} className="flex gap-4">
                <div className="relative">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${active ? "animate-glow-pulse" : ""}`}>
                    {done ? <Check className="h-5 w-5" /> : <Package className="h-4 w-4" />}
                  </div>
                  {i < STAGES.length - 1 && <div className={`absolute left-1/2 top-10 -translate-x-1/2 w-0.5 h-12 ${done ? "bg-primary" : "bg-border"}`} />}
                </div>
                <div className="pb-6">
                  <div className={`font-bold ${done ? "" : "text-muted-foreground"}`}>{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setStage(Math.min(3, stage + 1))} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-muted font-semibold">Advance stage (demo)</button>
          <button onClick={() => setStage(0)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-muted font-semibold">Reset</button>
        </div>
      </section>
    </main>
  );
}
