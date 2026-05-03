import { createFileRoute, Link } from "@tanstack/react-router";
import heroFarm from "@/assets/hero-farm.jpg";
import { products, farmers, seasonalTheme } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { PriceTicker } from "@/components/PriceTicker";
import { ShieldCheck, Sprout, Truck, Zap, ArrowRight, Star, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiDirect — Freshness Direct From Farm" },
      { name: "description", content: "Fresh fruits & vegetables straight from farmers near you. Cash on delivery, same-day shipping." },
    ],
  }),
  component: Index,
});

function Index() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main>
      {/* HERO with parallax */}
      <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.4}px)` }}>
          <img src={heroFarm} alt="Farmer holding fresh tomatoes at sunrise" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        {/* Floating produce */}
        <div className="absolute inset-0 pointer-events-none text-7xl">
          <span className="absolute top-[15%] left-[8%] animate-float-up">🍅</span>
          <span className="absolute top-[25%] right-[12%] animate-float-side text-6xl">🥭</span>
          <span className="absolute bottom-[28%] left-[14%] animate-float-side text-5xl" style={{ animationDelay: "0.6s" }}>🌶️</span>
          <span className="absolute bottom-[18%] right-[10%] animate-float-up text-6xl" style={{ animationDelay: "1.1s" }}>🥬</span>
        </div>

        <div className="relative z-10 flex h-full items-center px-4 md:px-8">
          <div className="mx-auto max-w-7xl w-full">
            <div className="max-w-2xl text-primary-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                <Sprout className="h-3.5 w-3.5" /> {seasonalTheme.emoji} {seasonalTheme.label}
              </span>
              <h1 className="display mt-5 text-5xl md:text-7xl font-extrabold leading-[1.05]">
                Freshness <span className="shimmer-text">Direct</span><br />From Farm.
              </h1>
              <p className="mt-5 text-lg md:text-xl text-white/85 max-w-xl">
                Real food. Real farmers. Zero middlemen. Order today, get it tomorrow — pay cash on delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" search={{ q: "" }} className="inline-flex items-center gap-2 rounded-full bg-harvest text-harvest-foreground px-6 py-3 font-bold shadow-glow hover:scale-105 transition">
                  Shop Fresh <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/farmers" className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur text-white px-6 py-3 font-semibold hover:bg-white/25 transition">
                  Meet Farmers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PriceTicker />

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { Icon: ShieldCheck, label: "Verified Farmers" },
          { Icon: Sprout, label: "No Middleman" },
          { Icon: Zap, label: "Secure Payment + COD" },
          { Icon: Truck, label: "Same Day Delivery" },
        ].map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 hover-lift">
            <div className="h-11 w-11 rounded-xl gradient-fresh flex items-center justify-center"><Icon className="h-5 w-5 text-primary-foreground" /></div>
            <div className="font-semibold text-sm">{label}</div>
          </div>
        ))}
      </section>

      {/* AI RECOMMENDATIONS */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-harvest font-bold">AI Picks for You</span>
            <h2 className="display text-4xl font-extrabold mt-1">In Season Near You</h2>
            <p className="text-muted-foreground mt-1 text-sm">Based on the season, your area, and freshness today.</p>
          </div>
          <Link to="/shop" search={{ q: "" }} className="hidden sm:inline-flex text-sm font-semibold text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* FARMER STORIES */}
      <section className="bg-secondary/40 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-harvest font-bold">Real People, Real Farms</span>
            <h2 className="display text-4xl font-extrabold mt-1">Meet Your Farmers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {farmers.map(f => (
              <div key={f.id} className="rounded-3xl bg-card border border-border overflow-hidden hover-lift shadow-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={f.photo} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{f.name}</h3>
                    {f.verified && <span className="text-[10px] font-bold uppercase bg-fresh text-fresh-foreground px-2 py-0.5 rounded-full">✓ Verified</span>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {f.location}
                  </div>
                  <p className="mt-3 text-sm">Specialty: <span className="font-semibold">{f.specialty}</span></p>
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-harvest text-harvest" />
                    <span className="font-bold">{f.rating}</span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
