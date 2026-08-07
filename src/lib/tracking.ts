/** Itahari-20, Sunsari HQ */
export const HQ = { lat: 26.755, lng: 87.28, label: "Itahari-20, Sunsari" };

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

export function parseGpsFromText(text?: string | null): { lat: number; lng: number } | null {
  if (!text) return null;
  const m = text.match(/GPS:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/i);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
