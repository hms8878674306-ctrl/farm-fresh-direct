import { useSyncExternalStore } from "react";
import type { Product } from "./data";
import { deals } from "./deals-store";

type CartItem = { product: Product; qty: number };
type State = { items: CartItem[] };

let state: State = { items: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const cart = {
  add(product: Product, qty = 1) {
    const existing = state.items.find(i => i.product.id === product.id);
    if (existing) {
      state = { items: state.items.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i) };
    } else {
      state = { items: [...state.items, { product, qty }] };
    }
    emit();
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) { state = { items: state.items.filter(i => i.product.id !== id) }; }
    else { state = { items: state.items.map(i => i.product.id === id ? { ...i, qty } : i) }; }
    emit();
  },
  remove(id: string) { state = { items: state.items.filter(i => i.product.id !== id) }; emit(); },
  clear() { state = { items: [] }; emit(); },
  get() { return state; },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};

const serverSnap: State = { items: [] };
export const useCart = () => useSyncExternalStore(cart.subscribe, cart.get, () => serverSnap);

// Effective unit price respects negotiated deals.
export function effectivePrice(p: Product): number {
  const d = deals.get(p.id);
  return d ? d.price : p.price;
}

export const cartTotal = (s: State) =>
  s.items.reduce((sum, i) => sum + effectivePrice(i.product) * i.qty, 0);
export const cartCount = (s: State) =>
  s.items.reduce((sum, i) => sum + i.qty, 0);

// Average distance of items in cart (km)
export const cartAvgDistance = (s: State) => {
  if (s.items.length === 0) return 0;
  const total = s.items.reduce((sum, i) => sum + (i.product.distanceKm || 0), 0);
  return total / s.items.length;
};
