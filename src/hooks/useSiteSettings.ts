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

const str = (v: unknown, fallback = ""): string => (v === undefined || v === null || v === "" ? fallback : String(v));

export const getContact = (settings: SiteSettings) => {
  const c = settings.contact ?? {};
  return {
    phone1: str(c.phone1, "9852049458"),
    phone2: str(c.phone2, "9802749458"),
    email: str(c.email, "ghagro2080@gmail.com"),
    address: str(c.address, "Patharishanishchare-5, Morang, Nepal"),
  };
};

export const getCompany = (settings: SiteSettings) => {
  const c = settings.company ?? {};
  return {
    company_name: str(c.company_name, "Great Sagarmatha Trade Pvt. Ltd."),
    tagline: str(c.tagline),
    about: str(c.about),
    website: str(c.website),
    whatsapp: str(c.whatsapp),
    business_hours: str(c.business_hours),
    email: str(c.email),
    phone1: str(c.phone1),
    phone2: str(c.phone2),
  };
};

export const getOwner = (settings: SiteSettings) => {
  const o = settings.owner ?? {};
  return {
    name: str(o.name, "Founder"),
    position: str(o.position, "Founder & CEO"),
    company: str(o.company),
    bio: str(o.bio),
    photo_url: str(o.photo_url),
    cover_url: str(o.cover_url),
    phone1: str(o.phone1),
    phone2: str(o.phone2),
    email: str(o.email),
    website: str(o.website),
    facebook: str(o.facebook),
    instagram: str(o.instagram),
    tiktok: str(o.tiktok),
    map_url: str(o.map_url),
    address: str(o.address),
    welcome: str(o.welcome),
  };
};

export const getSocial = (settings: SiteSettings) => {
  const s = settings.social ?? {};
  return {
    facebook: str(s.facebook),
    instagram: str(s.instagram),
    tiktok: str(s.tiktok),
    youtube: str(s.youtube),
    whatsapp: str(s.whatsapp),
  };
};

export const getLocation = (settings: SiteSettings) => {
  const l = settings.location ?? {};
  return {
    address: str(l.address),
    province: str(l.province),
    district: str(l.district),
    municipality: str(l.municipality),
    ward: str(l.ward),
    postal_code: str(l.postal_code),
    google_maps_url: str(l.google_maps_url),
    google_maps_embed: str(l.google_maps_embed),
    latitude: str(l.latitude),
    longitude: str(l.longitude),
  };
};

export const getBranding = (settings: SiteSettings) => {
  const b = settings.branding ?? {};
  return {
    logo_url: str(b.logo_url),
    favicon_url: str(b.favicon_url),
  };
};

export const composeAddress = (location: ReturnType<typeof getLocation>, fallback: string) => {
  const parts = [
    location.address,
    location.municipality && `Ward ${location.ward || ""} ${location.municipality}`.trim(),
    location.district,
    location.province,
    location.postal_code,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
};

export const waLink = (num: string) => {
  const digits = num.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits.startsWith("977") ? digits : `977${digits.replace(/^0/, "")}`}`;
};
