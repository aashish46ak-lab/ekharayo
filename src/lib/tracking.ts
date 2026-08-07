/** Morang HQ coordinates (Patharishanishchare-5) */
export const HQ = { lat: 26.6525, lng: 87.5389, label: "Patharishanishchare-5, Morang" };

/** Google Maps directions from HQ to customer address or coordinates */
export function mapsTrackUrl(opts: {
  addressLine?: string | null;
  city?: string | null;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
}) {
  const origin = `${HQ.lat},${HQ.lng}`;
  if (opts.lat != null && opts.lng != null && Number.isFinite(opts.lat) && Number.isFinite(opts.lng)) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${opts.lat},${opts.lng}&travelmode=driving`;
  }
  const dest = [opts.addressLine, opts.city, opts.district, "Nepal"].filter(Boolean).join(", ");
  if (!dest.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HQ.label)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(HQ.label)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
}

/** Parse GPS from address_line like "GPS: 26.12, 87.34" */
export function parseGpsFromText(text?: string | null): { lat: number; lng: number } | null {
  if (!text) return null;
  const m = text.match(/GPS:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/i);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
