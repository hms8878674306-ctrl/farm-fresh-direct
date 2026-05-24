import { useEffect, useState } from "react";

type Coords = { lat: number; lng: number };

/** Rider demo position — moves toward the customer as ETA counts down. */
function riderCoords(user: Coords, etaSeconds: number, delivered: boolean): Coords {
  if (delivered) return user;
  const progress = Math.min(1, Math.max(0, 1 - etaSeconds / 1200));
  const offsetKm = 2.5 * (1 - progress);
  const latOffset = offsetKm / 111;
  const lngOffset = offsetKm / (111 * Math.cos((user.lat * Math.PI) / 180));
  return { lat: user.lat + latOffset, lng: user.lng + lngOffset };
}

function haversineKm(a: Coords, b: Coords) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function useLiveGps(etaSeconds: number, delivered: boolean) {
  const [user, setUser] = useState<Coords | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(true);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setError(false);
        setUser({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError(true),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 12000 },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const rider = user ? riderCoords(user, etaSeconds, delivered) : null;
  const distanceKm = user && rider ? haversineKm(rider, user) : null;

  return { user, rider, distanceKm, error, gpsActive: Boolean(user) };
}
