import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { useLang } from "@/i18n/LanguageContext";
import { ArrowRight, BadgeCheck, Headset, Loader2, PackageX, ShieldCheck, Sparkles } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}
interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  images: string[];
  unit: string | null;
  featured: boolean;
  category_id: string | null;
  stock: number;
}

const reasons = [
  { icon: BadgeCheck, titleKey: "Trusted source" as const, desc: "Registered company with verified farm & supplier network." },
  { icon: ShieldCheck, titleKey: "Quality first" as const, desc: "Clear specs and careful handling before listing." },
  { icon: Headset, titleKey: "Real support" as const, desc: "Phone & WhatsApp help before and after your order." },
  { icon: Sparkles, titleKey: "Growing catalogue" as const, desc: "New local & international products added regularly." },
];

const HomeExtras = () => {
  const { t } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("categories").select("id,name,slug,image_url").order("sort_order"),
        supabase.from("products").select("id,name,price,sale_price,images,unit,featured,category_id,stock").eq("is_active", true).order("featured", { ascending: false }).limit(40),
      ]);
      const products = (p.data as unknown as Product[]) ?? [];
      const cats = (c.data as Category[]) ?? [];
      // Only show categories that have at least one active product in stock (or any stock product)
      const withItems = cats.filter((cat) => products.some((pr) => pr.category_id === cat.id && pr.stock > 0));
      // If all out of stock but category has products, still hide empty; show only non-empty
      const withAny = cats.filter((cat) => products.some((pr) => pr.category_id === cat.id));
      setCategories(withItems.length > 0 ? withItems.slice(0, 8) : withAny.slice(0, 8));
      setFeatured(products.filter((x) => x.stock > 0).slice(0, 8));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-background">
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{t("shopByCategory")}</h2>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
              {t("allProducts")} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/products"
                className="group relative rounded-2xl overflow-hidden border border-border aspect-[4/3] hover:border-primary/40 transition-all"
              >
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                  <span className="font-display font-bold text-white text-sm md:text-base">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{t("featured")}</h2>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            {t("viewAll")} <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <PackageX className="mx-auto text-muted-foreground mb-2" size={28} />
            <p className="font-body text-sm text-muted-foreground">Products will appear here once added in admin.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all"
              >
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <PackageX className="text-muted-foreground" size={24} />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-display font-bold text-foreground truncate">{p.name}</p>
                  <p className="font-body text-primary font-semibold mt-1">
                    {rs(Number(p.sale_price ?? p.price))}
                    {p.unit ? <span className="text-muted-foreground text-xs font-normal"> / {p.unit}</span> : null}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-border bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">{t("why")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {reasons.map(({ icon: Icon, titleKey, desc }) => (
              <div key={titleKey} className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <Icon className="text-primary" size={22} />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">{titleKey}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-7 py-3.5 rounded-lg hover:bg-green-glow transition-colors"
            >
              {t("shop")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeExtras;
