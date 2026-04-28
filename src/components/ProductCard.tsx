import { Minus, Plus, MapPin, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/data";
import { farmerById } from "@/lib/data";
import { cart } from "@/lib/cart-store";

const freshColor: Record<string, string> = {
  "Harvested Today": "bg-fresh text-fresh-foreground",
  "1 Day Fresh": "bg-accent text-accent-foreground",
  "Organic Certified": "bg-primary text-primary-foreground",
};

export function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const farmer = farmerById(product.farmerId);

  const add = () => {
    cart.add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div className="group rounded-2xl bg-card shadow-card hover-lift overflow-hidden border border-border">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} loading="lazy" width={800} height={800}
             className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${freshColor[product.freshness]}`}>
          {product.freshness}
        </span>
        {product.stock < 25 && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{farmer.name}</span>
            <span>•</span>
            <MapPin className="h-3 w-3" />
            <span>{product.distanceKm} km</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-extrabold text-primary">₹{product.price}</div>
            <div className="text-xs text-muted-foreground">per {product.unit}</div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border p-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-muted">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold">{qty}</span>
            <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-muted">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={add}
          className={`w-full h-10 rounded-xl font-semibold text-sm transition-all ${added ? "bg-fresh text-fresh-foreground animate-bounce-in" : "bg-primary text-primary-foreground hover:bg-primary-glow"}`}
        >
          {added ? "✓ Added to cart" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
