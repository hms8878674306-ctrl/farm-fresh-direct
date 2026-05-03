// Dynamic delivery pricing
export const FREE_DELIVERY_THRESHOLD = 499;
export const BASE_FEE = 25;
export const PER_KM = 6;

export function deliveryFee(subtotal: number, distanceKm: number) {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return Math.round(BASE_FEE + Math.max(0, distanceKm) * PER_KM);
}

// Rough pincode → distance heuristic (demo). Real app would geocode.
export function distanceFromPincode(pincode: string): number {
  const digits = pincode.replace(/\D/g, "");
  if (digits.length < 6) return 8;
  // Use last 3 digits to derive a stable 2–18 km value.
  const n = parseInt(digits.slice(-3), 10);
  return 2 + (n % 17);
}
