import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, Record<string, unknown>>;

let cache: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;

const fetchSettings = async (): Promise<SiteSettings> => {
  const { data } = await supabase.from("site_settings").select("key,value");
  const map: SiteSettings = {};
  (data ?? []).forEach((r) => {
    map[r.key] = (r.value as Record<string, unknown>) ?? {};
  });
  return map;
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let mounted = true;
    if (cache) {
      setSettings(cache);
      setLoading(false);
      return;
    }
    if (!inflight) inflight = fetchSettings();
    inflight.then((map) => {
      cache = map;
      if (mounted) {
        setSettings(map);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { settings, loading };
};

/** Call after admin saves to force public refresh on next load */
export const invalidateSiteSettingsCache = () => {
  cache = null;
  inflight = null;
};

const str = (v: unknown, fallback = ""): string =>
  v === undefined || v === null || v === "" ? fallback : String(v);

export const getContact = (settings: SiteSettings) => {
  const c = settings.contact ?? {};
  return {
    phone1: str(c.phone1, ""),
    phone2: str(c.phone2, ""),
    email: str(c.email, ""),
    address: str(c.address, "Itahari-20, Sunsari, Nepal"),
  };
};

export const getCompany = (settings: SiteSettings) => {
  const c = settings.company ?? {};
  return {
    company_name: str(c.company_name, "Great Sagarmatha Trade Pvt. Ltd."),
    tagline: str(c.tagline, ""),
    about: str(c.about, ""),
    business_hours: str(c.business_hours, ""),
    email: str(c.email, ""),
    phone1: str(c.phone1, ""),
    phone2: str(c.phone2, ""),
    whatsapp: str(c.whatsapp, ""),
  };
};

export const getLocation = (settings: SiteSettings) => {
  const l = settings.location ?? {};
  return {
    address: str(l.address, "Itahari-20, Sunsari"),
    province: str(l.province, ""),
    district: str(l.district, "Sunsari"),
    municipality: str(l.municipality, "Itahari"),
    ward: str(l.ward, "20"),
    postal_code: str(l.postal_code, ""),
    google_maps_url: str(l.google_maps_url, ""),
    google_maps_embed: str(l.google_maps_embed, ""),
    latitude: str(l.latitude, "26.755"),
    longitude: str(l.longitude, "87.28"),
  };
};

export const getOwner = (settings: SiteSettings) => {
  const o = settings.owner ?? {};
  return {
    name: str(o.name, ""),
    position: str(o.position, ""),
    company: str(o.company, ""),
    bio: str(o.bio, ""),
    welcome: str(o.welcome, ""),
    phone1: str(o.phone1, ""),
    phone2: str(o.phone2, ""),
    email: str(o.email, ""),
    website: str(o.website, ""),
    photo_url: str(o.photo_url, ""),
    cover_url: str(o.cover_url, ""),
    address: str(o.address, ""),
    map_url: str(o.map_url, ""),
    facebook: str(o.facebook, ""),
    instagram: str(o.instagram, ""),
    tiktok: str(o.tiktok, ""),
  };
};

export const getBranding = (settings: SiteSettings) => {
  const b = settings.branding ?? {};
  return {
    logo_url: str(b.logo_url, ""),
  };
};

export const getSocial = (settings: SiteSettings) => {
  const s = settings.social ?? {};
  return {
    facebook: str(s.facebook, ""),
    instagram: str(s.instagram, ""),
    tiktok: str(s.tiktok, ""),
    youtube: str(s.youtube, ""),
    whatsapp: str(s.whatsapp, ""),
  };
};

export const composeAddress = (
  location: ReturnType<typeof getLocation>,
  fallback?: string,
) =>
  [location.address, location.ward ? `Ward ${location.ward}` : "", location.municipality, location.district, location.province]
    .filter(Boolean)
    .join(", ") || fallback || "";

export const waLink = (phone: string, text?: string) => {
  const n = phone.replace(/\D/g, "");
  if (!n) return "#";
  const full = n.startsWith("977") ? n : `977${n.replace(/^0/, "")}`;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
