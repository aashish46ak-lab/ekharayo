/** Haversine distance in km between two WGS84 points */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface DeliveryTierConfig {
  hq: { name: string; lat: number; lng: number };
  base_fee: number;
  free_above: number;
  max_fee: number;
  tiers: { max_km: number; fee: number }[];
}

/** Base: Itahari-20, Sunsari */
export const DEFAULT_DELIVERY: DeliveryTierConfig = {
  hq: { name: "Itahari-20, Sunsari", lat: 26.755, lng: 87.28 },
  base_fee: 50,
  free_above: 3000,
  max_fee: 350,
  tiers: [
    { max_km: 10, fee: 50 },
    { max_km: 25, fee: 100 },
    { max_km: 50, fee: 150 },
    { max_km: 100, fee: 250 },
    { max_km: 150, fee: 300 },
    { max_km: 9999, fee: 350 },
  ],
};

export function feeForDistance(km: number, cfg: DeliveryTierConfig = DEFAULT_DELIVERY): number {
  const sorted = [...cfg.tiers].sort((a, b) => a.max_km - b.max_km);
  let fee = sorted[sorted.length - 1]?.fee ?? cfg.base_fee;
  for (const t of sorted) {
    if (km <= t.max_km) {
      fee = t.fee;
      break;
    }
  }
  const cap = Number(cfg.max_fee ?? 350);
  return Math.min(fee, cap);
}

export function computeDeliveryFee(
  subtotal: number,
  customerLat: number | null,
  customerLng: number | null,
  cfg: DeliveryTierConfig = DEFAULT_DELIVERY,
): { fee: number; km: number | null; free: boolean; label: string } {
  if (subtotal >= Number(cfg.free_above || 0) && Number(cfg.free_above) > 0) {
    return { fee: 0, km: null, free: true, label: `Free delivery on orders over Rs. ${cfg.free_above}` };
  }
  if (customerLat == null || customerLng == null || !Number.isFinite(customerLat) || !Number.isFinite(customerLng)) {
    return { fee: cfg.base_fee, km: null, free: false, label: `Standard delivery from ${cfg.hq.name} (Rs. ${cfg.base_fee})` };
  }
  const km = distanceKm(cfg.hq.lat, cfg.hq.lng, customerLat, customerLng);
  const fee = feeForDistance(km, cfg);
  return {
    fee,
    km: Math.round(km * 10) / 10,
    free: false,
    label: `${km.toFixed(1)} km from Itahari HQ — delivery Rs. ${fee}`,
  };
}
