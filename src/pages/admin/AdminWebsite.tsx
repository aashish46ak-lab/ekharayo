import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

type Settings = Record<string, Record<string, unknown>>;

const textFields: { key: string; label: string; fields: { name: string; label: string; area?: boolean }[] }[] = [
  { key: "hero", label: "Homepage hero", fields: [{ name: "badge", label: "Badge" }, { name: "title", label: "Title" }, { name: "highlight", label: "Highlighted line" }, { name: "subtitle", label: "Subtitle", area: true }] },
  { key: "about", label: "About page", fields: [{ name: "body", label: "About text", area: true }] },
  { key: "contact", label: "Contact details", fields: [{ name: "phone1", label: "Phone 1" }, { name: "phone2", label: "Phone 2" }, { name: "email", label: "Email" }, { name: "address", label: "Address" }] },
  { key: "privacy", label: "Privacy policy", fields: [{ name: "body", label: "Policy text", area: true }] },
  { key: "terms", label: "Terms & conditions", fields: [{ name: "body", label: "Terms text", area: true }] },
  { key: "shipping", label: "Shipping policy", fields: [{ name: "body", label: "Shipping text", area: true }] },
  { key: "returns", label: "Return policy", fields: [{ name: "body", label: "Return text", area: true }] },
  { key: "footer", label: "Footer", fields: [{ name: "text", label: "Footer text", area: true }] },
  { key: "social", label: "Social media links", fields: [{ name: "facebook", label: "Facebook" }, { name: "instagram", label: "Instagram" }, { name: "tiktok", label: "TikTok" }, { name: "youtube", label: "YouTube" }] },
  { key: "store", label: "Store settings", fields: [{ name: "delivery_fee", label: "Delivery fee (Rs.)" }] },
];

const AdminWebsite = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [busy, setBusy] = useState(false);
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([]);

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("key,value");
    const map: Settings = {};
    (data ?? []).forEach((r) => { map[r.key] = (r.value as Record<string, unknown>) ?? {}; });
    setSettings(map);
    setFaq(((map.faq?.items as { q: string; a: string }[]) ?? []));
  };
  useEffect(() => { load(); }, []);

  const saveKey = async (key: string, value: Record<string, unknown>) => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert({ key, value: value as never });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const set = (key: string, name: string, value: unknown) =>
    setSettings((s) => ({ ...s, [key]: { ...(s[key] ?? {}), [name]: value } }));

  const upload = async (key: string, name: string, file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, "site");
      const next = { ...(settings[key] ?? {}), [name]: url };
      setSettings((s) => ({ ...s, [key]: next }));
      await saveKey(key, next);
    } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  const field = "w-full border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const card = "bg-card border border-border rounded-xl p-5 space-y-3";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Website content</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {textFields.map((group) => (
          <div key={group.key} className={card}>
            <h2 className="font-display font-bold text-foreground">{group.label}</h2>
            {group.fields.map((f) =>
              f.area ? (
                <textarea key={f.name} rows={4} placeholder={f.label} value={String(settings[group.key]?.[f.name] ?? "")} onChange={(e) => set(group.key, f.name, e.target.value)} className={`${field} resize-none`} />
              ) : (
                <input key={f.name} placeholder={f.label} value={String(settings[group.key]?.[f.name] ?? "")} onChange={(e) => set(group.key, f.name, e.target.value)} className={field} />
              ),
            )}
            <button onClick={() => saveKey(group.key, settings[group.key] ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
            </button>
          </div>
        ))}

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">FAQ</h2>
          {faq.map((item, idx) => (
            <div key={idx} className="space-y-2 border-b border-border pb-3">
              <input value={item.q} onChange={(e) => setFaq(faq.map((f, i) => (i === idx ? { ...f, q: e.target.value } : f)))} placeholder="Question" className={field} />
              <textarea rows={2} value={item.a} onChange={(e) => setFaq(faq.map((f, i) => (i === idx ? { ...f, a: e.target.value } : f)))} placeholder="Answer" className={`${field} resize-none`} />
              <button onClick={() => setFaq(faq.filter((_, i) => i !== idx))} className="font-body text-xs text-destructive">Remove</button>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setFaq([...faq, { q: "", a: "" }])} className="border border-border text-foreground font-body text-sm px-4 py-2.5 rounded-lg hover:border-primary/40">Add question</button>
            <button onClick={() => saveKey("faq", { items: faq })} className="bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow">Save FAQ</button>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Logo, favicon & banners</h2>
          <label className="font-body text-sm text-foreground block">Logo</label>
          <input type="file" accept="image/*" className="font-body text-sm text-muted-foreground" onChange={(e) => upload("branding", "logo_url", e.target.files?.[0])} />
          {settings.branding?.logo_url ? <img src={String(settings.branding.logo_url)} alt="Logo" className="h-12 w-auto" /> : null}
          <label className="font-body text-sm text-foreground block">Favicon</label>
          <input type="file" accept="image/*" className="font-body text-sm text-muted-foreground" onChange={(e) => upload("branding", "favicon_url", e.target.files?.[0])} />
          <label className="font-body text-sm text-foreground block">Banner image</label>
          <input type="file" accept="image/*" className="font-body text-sm text-muted-foreground" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try {
              const url = await uploadMedia(f, "banners");
              const list = [...((settings.banners?.images as string[]) ?? []), url];
              setSettings((s) => ({ ...s, banners: { images: list } }));
              await saveKey("banners", { images: list });
            } catch (err) { toast.error((err as Error).message); }
            setBusy(false);
          }} />
          <div className="flex flex-wrap gap-2">
            {((settings.banners?.images as string[]) ?? []).map((src) => (
              <img key={src} src={src} alt="Banner" className="w-24 h-16 object-cover rounded" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 pt-2">
          <h2 className="font-display text-xl font-bold text-foreground">Ownership &amp; Company Information</h2>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Company info</h2>
          <input placeholder="Company name" value={String(settings.company?.company_name ?? "")} onChange={(e) => set("company", "company_name", e.target.value)} className={field} />
          <input placeholder="Tagline" value={String(settings.company?.tagline ?? "")} onChange={(e) => set("company", "tagline", e.target.value)} className={field} />
          <textarea rows={4} placeholder="About company" value={String(settings.company?.about ?? "")} onChange={(e) => set("company", "about", e.target.value)} className={`${field} resize-none`} />
          <input placeholder="Website" value={String(settings.company?.website ?? "")} onChange={(e) => set("company", "website", e.target.value)} className={field} />
          <input placeholder="WhatsApp number" value={String(settings.company?.whatsapp ?? "")} onChange={(e) => set("company", "whatsapp", e.target.value)} className={field} />
          <input placeholder="Business hours" value={String(settings.company?.business_hours ?? "")} onChange={(e) => set("company", "business_hours", e.target.value)} className={field} />
          <input placeholder="Email" value={String(settings.company?.email ?? "")} onChange={(e) => set("company", "email", e.target.value)} className={field} />
          <input placeholder="Phone 1" value={String(settings.company?.phone1 ?? "")} onChange={(e) => set("company", "phone1", e.target.value)} className={field} />
          <input placeholder="Phone 2" value={String(settings.company?.phone2 ?? "")} onChange={(e) => set("company", "phone2", e.target.value)} className={field} />
          <button onClick={() => saveKey("company", settings.company ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Owner / Founder</h2>
          <input placeholder="Name" value={String(settings.owner?.name ?? "")} onChange={(e) => set("owner", "name", e.target.value)} className={field} />
          <input placeholder="Position / Designation" value={String(settings.owner?.position ?? "")} onChange={(e) => set("owner", "position", e.target.value)} className={field} />
          <input placeholder="Company" value={String(settings.owner?.company ?? "")} onChange={(e) => set("owner", "company", e.target.value)} className={field} />
          <textarea rows={3} placeholder="Bio / About" value={String(settings.owner?.bio ?? "")} onChange={(e) => set("owner", "bio", e.target.value)} className={`${field} resize-none`} />
          <textarea rows={2} placeholder="Welcome message" value={String(settings.owner?.welcome ?? "")} onChange={(e) => set("owner", "welcome", e.target.value)} className={`${field} resize-none`} />
          <input placeholder="Phone 1" value={String(settings.owner?.phone1 ?? "")} onChange={(e) => set("owner", "phone1", e.target.value)} className={field} />
          <input placeholder="Phone 2" value={String(settings.owner?.phone2 ?? "")} onChange={(e) => set("owner", "phone2", e.target.value)} className={field} />
          <input placeholder="Email" value={String(settings.owner?.email ?? "")} onChange={(e) => set("owner", "email", e.target.value)} className={field} />
          <input placeholder="Website" value={String(settings.owner?.website ?? "")} onChange={(e) => set("owner", "website", e.target.value)} className={field} />
          <input placeholder="Facebook" value={String(settings.owner?.facebook ?? "")} onChange={(e) => set("owner", "facebook", e.target.value)} className={field} />
          <input placeholder="Instagram" value={String(settings.owner?.instagram ?? "")} onChange={(e) => set("owner", "instagram", e.target.value)} className={field} />
          <input placeholder="TikTok" value={String(settings.owner?.tiktok ?? "")} onChange={(e) => set("owner", "tiktok", e.target.value)} className={field} />
          <input placeholder="Map URL" value={String(settings.owner?.map_url ?? "")} onChange={(e) => set("owner", "map_url", e.target.value)} className={field} />
          <input placeholder="Address" value={String(settings.owner?.address ?? "")} onChange={(e) => set("owner", "address", e.target.value)} className={field} />
          <label className="font-body text-sm text-foreground block">Photo</label>
          <input type="file" accept="image/*" className="font-body text-sm text-muted-foreground" onChange={(e) => upload("owner", "photo_url", e.target.files?.[0])} />
          {settings.owner?.photo_url ? <img src={String(settings.owner.photo_url)} alt="Owner" className="h-20 w-20 object-cover rounded-lg" /> : null}
          <label className="font-body text-sm text-foreground block">Cover image</label>
          <input type="file" accept="image/*" className="font-body text-sm text-muted-foreground" onChange={(e) => upload("owner", "cover_url", e.target.files?.[0])} />
          {settings.owner?.cover_url ? <img src={String(settings.owner.cover_url)} alt="Cover" className="h-20 w-full object-cover rounded-lg" /> : null}
          <button onClick={() => saveKey("owner", settings.owner ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Social links</h2>
          <input placeholder="Facebook" value={String(settings.social?.facebook ?? "")} onChange={(e) => set("social", "facebook", e.target.value)} className={field} />
          <input placeholder="Instagram" value={String(settings.social?.instagram ?? "")} onChange={(e) => set("social", "instagram", e.target.value)} className={field} />
          <input placeholder="TikTok" value={String(settings.social?.tiktok ?? "")} onChange={(e) => set("social", "tiktok", e.target.value)} className={field} />
          <input placeholder="YouTube" value={String(settings.social?.youtube ?? "")} onChange={(e) => set("social", "youtube", e.target.value)} className={field} />
          <input placeholder="WhatsApp number" value={String(settings.social?.whatsapp ?? "")} onChange={(e) => set("social", "whatsapp", e.target.value)} className={field} />
          <button onClick={() => saveKey("social", settings.social ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Location</h2>
          <input placeholder="Address" value={String(settings.location?.address ?? "")} onChange={(e) => set("location", "address", e.target.value)} className={field} />
          <input placeholder="Province" value={String(settings.location?.province ?? "")} onChange={(e) => set("location", "province", e.target.value)} className={field} />
          <input placeholder="District" value={String(settings.location?.district ?? "")} onChange={(e) => set("location", "district", e.target.value)} className={field} />
          <input placeholder="Municipality" value={String(settings.location?.municipality ?? "")} onChange={(e) => set("location", "municipality", e.target.value)} className={field} />
          <input placeholder="Ward" value={String(settings.location?.ward ?? "")} onChange={(e) => set("location", "ward", e.target.value)} className={field} />
          <input placeholder="Postal code" value={String(settings.location?.postal_code ?? "")} onChange={(e) => set("location", "postal_code", e.target.value)} className={field} />
          <input placeholder="Google Maps link" value={String(settings.location?.google_maps_url ?? "")} onChange={(e) => set("location", "google_maps_url", e.target.value)} className={field} />
          <input placeholder="Google Maps embed URL" value={String(settings.location?.google_maps_embed ?? "")} onChange={(e) => set("location", "google_maps_embed", e.target.value)} className={field} />
          <input placeholder="Latitude" value={String(settings.location?.latitude ?? "")} onChange={(e) => set("location", "latitude", e.target.value)} className={field} />
          <input placeholder="Longitude" value={String(settings.location?.longitude ?? "")} onChange={(e) => set("location", "longitude", e.target.value)} className={field} />
          <button onClick={() => saveKey("location", settings.location ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsite;
