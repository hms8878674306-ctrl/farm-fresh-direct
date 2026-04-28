import tomato from "@/assets/p-tomato.jpg";
import onion from "@/assets/p-onion.jpg";
import mango from "@/assets/p-mango.jpg";
import spinach from "@/assets/p-spinach.jpg";
import capsicum from "@/assets/p-capsicum.jpg";
import carrot from "@/assets/p-carrot.jpg";
import farmer1 from "@/assets/farmer1.jpg";
import farmer2 from "@/assets/farmer2.jpg";
import farmer3 from "@/assets/farmer3.jpg";

export type Freshness = "Harvested Today" | "1 Day Fresh" | "Organic Certified";

export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  prevPrice: number;
  unit: string;
  stock: number;
  freshness: Freshness;
  farmerId: string;
  distanceKm: number;
  category: "vegetable" | "fruit" | "leafy";
};

export type Farmer = {
  id: string;
  name: string;
  photo: string;
  location: string;
  specialty: string;
  rating: number;
  verified: boolean;
};

export const farmers: Farmer[] = [
  { id: "f1", name: "Ramesh Patel", photo: farmer1, location: "Nashik, MH", specialty: "Tomatoes & Onions", rating: 4.9, verified: true },
  { id: "f2", name: "Lakshmi Devi", photo: farmer2, location: "Mysuru, KA", specialty: "Leafy Greens", rating: 4.8, verified: true },
  { id: "f3", name: "Arjun Singh", photo: farmer3, location: "Ratnagiri, MH", specialty: "Mangoes & Carrots", rating: 4.95, verified: true },
];

export const products: Product[] = [
  { id: "p1", name: "Vine Tomatoes", image: tomato, price: 38, prevPrice: 40, unit: "kg", stock: 42, freshness: "Harvested Today", farmerId: "f1", distanceKm: 8, category: "vegetable" },
  { id: "p2", name: "Red Onions",    image: onion,  price: 29, prevPrice: 28, unit: "kg", stock: 65, freshness: "1 Day Fresh",      farmerId: "f1", distanceKm: 8, category: "vegetable" },
  { id: "p3", name: "Alphonso Mango",image: mango,  price: 280,prevPrice: 290,unit: "dozen",stock: 18,freshness: "Harvested Today", farmerId: "f3", distanceKm: 14, category: "fruit" },
  { id: "p4", name: "Palak Spinach", image: spinach,price: 22, prevPrice: 25, unit: "bunch",stock: 30,freshness: "Organic Certified",farmerId: "f2", distanceKm: 5, category: "leafy" },
  { id: "p5", name: "Green Capsicum",image: capsicum,price:55, prevPrice: 55, unit: "kg", stock: 24, freshness: "1 Day Fresh",      farmerId: "f2", distanceKm: 5, category: "vegetable" },
  { id: "p6", name: "Baby Carrots",  image: carrot, price: 48, prevPrice: 50, unit: "kg", stock: 38, freshness: "Organic Certified",farmerId: "f3", distanceKm: 14, category: "vegetable" },
];

export const farmerById = (id: string) => farmers.find(f => f.id === id)!;

export const priceFlash = products.map(p => ({
  name: p.name,
  delta: +(p.price - p.prevPrice).toFixed(0),
}));

export const seasonalTheme = (() => {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 5) return { label: "Summer Mango Season", emoji: "🥭", gradient: "gradient-harvest" };
  if (m >= 6 && m <= 9) return { label: "Monsoon Greens", emoji: "🥬", gradient: "gradient-fresh" };
  return { label: "Winter Harvest", emoji: "🥕", gradient: "gradient-sunrise" };
})();
