// Negotiated deal prices, persisted per product.
import { useSyncExternalStore } from "react";

export type Deal = { productId: string; price: number; qty: number; at: number };
const KEY = "krishi-deals";
let map: Record<string, Deal> = {};

if (typeof window !== "undefined") {
  try { map = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
}
const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(map));
  listeners.forEach(l => l());
};

export const deals = {
  set(d: Deal) { map = { ...map, [d.productId]: d }; emit(); },
  clear(productId: string) { const { [productId]: _, ...rest } = map; map = rest; emit(); },
  get(productId: string): Deal | undefined { return map[productId]; },
  all() { return map; },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};

const serverSnap: Record<string, Deal> = {};
export const useDeals = () =>
  useSyncExternalStore(deals.subscribe, deals.all, () => serverSnap);
