// Seeds Firestore with mock farmers + products on first run.
// Idempotent: checks if `products` collection has any docs first.
import { db } from "./firebase";
import { collection, getDocs, limit, query, writeBatch, doc } from "firebase/firestore";
import { farmers as mockFarmers, products as mockProducts } from "./data";

let seedingPromise: Promise<void> | null = null;

export function seedIfEmpty() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    const snap = await getDocs(query(collection(db, "products"), limit(1)));
    if (!snap.empty) return;

    const batch = writeBatch(db);
    for (const f of mockFarmers) {
      batch.set(doc(db, "farmers", f.id), {
        name: f.name,
        photo: f.photo,
        location: f.location,
        specialty: f.specialty,
        rating: f.rating,
        verified: f.verified,
      });
    }
    for (const p of mockProducts) {
      batch.set(doc(db, "products", p.id), {
        name: p.name,
        image: p.image,
        price: p.price,
        prevPrice: p.prevPrice,
        unit: p.unit,
        stock: p.stock,
        freshness: p.freshness,
        farmerId: p.farmerId,
        distanceKm: p.distanceKm,
        category: p.category,
      });
    }
    await batch.commit();
  })().catch((e) => {
    console.warn("[seed] skipped:", e?.message || e);
  });
  return seedingPromise;
}
