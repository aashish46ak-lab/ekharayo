import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import { ADMIN_COPY_KEYS, defaultDict, type DictKey, type Lang } from "@/i18n/defaults";

type Settings = Record<string, Record<string, unknown>>;

const textFields: { key: string; label: string; fields: { name: string; label: string; area?: boolean }[] }[] = [
  { key: "hero", label: "Homepage hero (legacy single-lang)", fields: [{ name: "badge", label: "Badge" }, { name: "title", label: "Title" }, { name: "highlight", label: "Highlighted line" }, { name: "subtitle", label: "Subtitle", area: true }] },
  { key: "about", label: "About page body", fields: [{ name: "body", label: "About text", area: true }] },
  { key: "contact", label: "Contact details", fields: [{ name: "phone1", label: "Phone 1" }, { name: "phone2", label: "Phone 2" }, { name: "email", label: "Email" }, { name: "address", label: "Address (e.g. Itahari-20, Sunsari)" }] },
  { key: "privacy", label: "Privacy policy", fields: [{ name: "body", label: "Policy text", area: true }] },
  { key: "terms", label: "Terms & conditions", fields: [{ name: "body", label: "Terms text", area: true }] },
  { key: "shipping", label: "Shipping policy", fields: [{ name: "body", label: "Shipping text", area: true }] },
  { key: "returns", label: "Return policy", fields: [{ name: "body", label: "Return text", area: true }] },
  { key: "footer", label: "Footer", fields: [{ name: "text", label: "Footer text", area: true }] },
  { key: "social", label: "Social media links", fields: [{ name: "facebook", label: "Facebook" }, { name: "instagram", label: "Instagram" }, { name: "tiktok", label: "TikTok" }, { name: "youtube", label: "YouTube" }, { name: "whatsapp", label: "WhatsApp number" }] },
  { key: "store", label: "Store settings", fields: [{ name: "delivery_fee", label: "Fallback delivery fee (Rs.)" }, { name: "tax_rate", label: "Tax rate %" }] },
];

const AdminWebsite = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [busy, setBusy] = useState(false);
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([]);
  const [copyLang, setCopyLang] = useState<Lang>("en");
  const [copy, setCopy] = useState<Record<Lang, Partial<Record<DictKey, string>>>>({
    en: {},
    ne: {},
  });

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("key,value");
    const map: Settings = {};
    (data ?? []).forEach((r) => {
      map[r.key] = (r.value as Record<string, unknown>) ?? {};
    });
    setSettings(map);
    setFaq((map.faq?.items as { q: string; a: string }[]) ?? []);
    const c = map.copy as Record<Lang, Partial<Record<DictKey, string>>> | undefined;
    setCopy({
      en: { ...(c?.en ?? {}) },
      ne: { ...(c?.ne ?? {}) },
    });
  };
  useEffect(() => {
    load();
  }, []);

  const saveKey = async (key: string, value: Record<string, unknown>) => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    load();
  };

  const set = (key: string, name: string, val: string) => {
    setSettings((s) => ({
      ...s,
      [key]: { ...(s[key] ?? {}), [name]: val },
    }));
  };

  const setCopyField = (lang: Lang, key: DictKey, val: string) => {
    setCopy((c) => ({
      ...c,
      [lang]: { ...c[lang], [key]: val },
    }));
  };

  const saveCopy = async () => {
    setBusy(true);
    // strip empty so defaults show
    const clean: Record<Lang, Record<string, string>> = { en: {}, ne: {} };
    ("en" as const, "ne" as const);
    for (const lang of ["en", "ne"] as Lang[]) {
      for (const [k, v] of Object.entries(copy[lang] ?? {})) {
        if (v != null && String(v).trim()) clean[lang][k] = String(v).trim();
      }
    }
    const { error } = await supabase.from("site_settings").upsert({ key: "copy", value: clean }, { onConflict: "key" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Translations saved — refresh the public site to see EN/NE text");
    load();
  };

  const fillDefaults = (lang: Lang) => {
    const next: Partial<Record<DictKey, string>> = {};
    for (const { key } of ADMIN_COPY_KEYS) {
      next[key] = copy[lang][key] || defaultDict[lang][key];
    }
    setCopy((c) => ({ ...c, [lang]: next }));
    toast.message(`Filled ${lang.toUpperCase()} fields with defaults (Save to store)`);
  };

  const onUpload = async (key: string, field: string, file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, "branding");
      set(key, field, url);
      await saveKey(key, { ...(settings[key] ?? {}), [field]: url });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const card = "bg-card border border-border rounded-xl p-5 space-y-3";

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Website content</h1>

      {/* Bilingual translations — main answer to "admin editable form" */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-foreground">Translations (EN / नेपाली)</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Edit any public text here. Empty field = use built-in default. Switch language on the site with the floating EN/नेप button.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-border p-0.5">
            <button
              type="button"
              onClick={() => setCopyLang("en")}
              className={`px-3 py-1 rounded-full text-xs font-bold ${copyLang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setCopyLang("ne")}
              className={`px-3 py-1 rounded-full text-xs font-bold ${copyLang === "ne" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              नेपाली
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fillDefaults(copyLang)} className="text-xs font-semibold text-primary hover:underline">
            Fill {copyLang.toUpperCase()} with defaults
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-h-[28rem] overflow-y-auto pr-1">
          {ADMIN_COPY_KEYS.map((f) => {
            const val = copy[copyLang][f.key] ?? "";
            const placeholder = defaultDict[copyLang][f.key];
            return (
              <div key={f.key} className="space-y-1">
                <label className="font-body text-[11px] text-muted-foreground">{f.label}</label>
                {f.area ? (
                  <textarea
                    rows={3}
                    value={val}
                    placeholder={placeholder}
                    onChange={(e) => setCopyField(copyLang, f.key, e.target.value)}
                    className={`${field} resize-y`}
                  />
                ) : (
                  <input
                    value={val}
                    placeholder={placeholder}
                    onChange={(e) => setCopyField(copyLang, f.key, e.target.value)}
                    className={field}
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={saveCopy}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save translations
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {textFields.map((group) => (
          <div key={group.key} className={card}>
            <h2 className="font-display font-bold text-foreground">{group.label}</h2>
            {group.fields.map((f) =>
              f.area ? (
                <textarea
                  key={f.name}
                  rows={4}
                  placeholder={f.label}
                  value={String(settings[group.key]?.[f.name] ?? "")}
                  onChange={(e) => set(group.key, f.name, e.target.value)}
                  className={`${field} resize-none`}
                />
              ) : (
                <input
                  key={f.name}
                  placeholder={f.label}
                  value={String(settings[group.key]?.[f.name] ?? "")}
                  onChange={(e) => set(group.key, f.name, e.target.value)}
                  className={field}
                />
              ),
            )}
            <button
              type="button"
              onClick={() => saveKey(group.key, settings[group.key] ?? {})}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
            </button>
          </div>
        ))}

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Branding / logo</h2>
          <input type="file" accept="image/*" onChange={(e) => onUpload("branding", "logo_url", e.target.files?.[0] ?? null)} className="font-body text-sm text-muted-foreground" />
          {settings.branding?.logo_url ? (
            <div className="flex items-center gap-3">
              <img src={String(settings.branding.logo_url)} alt="Logo" className="h-12 w-auto" />
              <button type="button" onClick={() => saveKey("branding", { ...settings.branding, logo_url: "" })} className="text-destructive text-xs flex items-center gap-1">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ) : null}
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Company</h2>
          <input placeholder="Company name" value={String(settings.company?.company_name ?? "")} onChange={(e) => set("company", "company_name", e.target.value)} className={field} />
          <input placeholder="Tagline" value={String(settings.company?.tagline ?? "")} onChange={(e) => set("company", "tagline", e.target.value)} className={field} />
          <textarea rows={3} placeholder="About company" value={String(settings.company?.about ?? "")} onChange={(e) => set("company", "about", e.target.value)} className={`${field} resize-none`} />
          <input placeholder="Business hours" value={String(settings.company?.business_hours ?? "")} onChange={(e) => set("company", "business_hours", e.target.value)} className={field} />
          <button type="button" onClick={() => saveKey("company", settings.company ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Owner / founder (Ownership page)</h2>
          <input placeholder="Name" value={String(settings.owner?.name ?? "")} onChange={(e) => set("owner", "name", e.target.value)} className={field} />
          <input placeholder="Position" value={String(settings.owner?.position ?? "")} onChange={(e) => set("owner", "position", e.target.value)} className={field} />
          <textarea rows={3} placeholder="Bio / welcome" value={String(settings.owner?.bio ?? settings.owner?.welcome ?? "")} onChange={(e) => set("owner", "bio", e.target.value)} className={`${field} resize-none`} />
          <input placeholder="Phone" value={String(settings.owner?.phone1 ?? "")} onChange={(e) => set("owner", "phone1", e.target.value)} className={field} />
          <input placeholder="Email" value={String(settings.owner?.email ?? "")} onChange={(e) => set("owner", "email", e.target.value)} className={field} />
          <input type="file" accept="image/*" onChange={(e) => onUpload("owner", "photo_url", e.target.files?.[0] ?? null)} className="font-body text-sm text-muted-foreground" />
          <button type="button" onClick={() => saveKey("owner", settings.owner ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">Location (Itahari-20, Sunsari recommended)</h2>
          <input placeholder="Address" value={String(settings.location?.address ?? "")} onChange={(e) => set("location", "address", e.target.value)} className={field} />
          <input placeholder="District" value={String(settings.location?.district ?? "")} onChange={(e) => set("location", "district", e.target.value)} className={field} />
          <input placeholder="Municipality" value={String(settings.location?.municipality ?? "")} onChange={(e) => set("location", "municipality", e.target.value)} className={field} />
          <input placeholder="Ward" value={String(settings.location?.ward ?? "")} onChange={(e) => set("location", "ward", e.target.value)} className={field} />
          <input placeholder="Google Maps link" value={String(settings.location?.google_maps_url ?? "")} onChange={(e) => set("location", "google_maps_url", e.target.value)} className={field} />
          <input placeholder="Latitude" value={String(settings.location?.latitude ?? "")} onChange={(e) => set("location", "latitude", e.target.value)} className={field} />
          <input placeholder="Longitude" value={String(settings.location?.longitude ?? "")} onChange={(e) => set("location", "longitude", e.target.value)} className={field} />
          <button type="button" onClick={() => saveKey("location", settings.location ?? {})} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground">FAQ</h2>
          {faq.map((item, i) => (
            <div key={i} className="space-y-2 border border-border rounded-lg p-3">
              <input placeholder="Question" value={item.q} onChange={(e) => setFaq((f) => f.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className={field} />
              <textarea rows={2} placeholder="Answer" value={item.a} onChange={(e) => setFaq((f) => f.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} className={`${field} resize-none`} />
              <button type="button" onClick={() => setFaq((f) => f.filter((_, j) => j !== i))} className="text-xs text-destructive">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setFaq((f) => [...f, { q: "", a: "" }])} className="text-sm text-primary font-semibold">+ Add FAQ</button>
          <button type="button" onClick={() => saveKey("faq", { items: faq })} disabled={busy} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save FAQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsite;
