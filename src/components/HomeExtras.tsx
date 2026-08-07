import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { ArrowRight, BadgeCheck, Headset, Loader2, PackageX, ShieldCheck, Sparkles } from "lucide-react";
import dairy from "@/assets/dairy.jpg";
import chicken from "@/assets/chicken.jpg";
import goat from "@/assets/goat.jpg";
import crops from "@/assets/crops.jpg";

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
}

const fallbackCats = [
  { name: "Dairy", img: dairy, href: "/products" },
  { name: "Chicken", img: chicken, href: "/products" },
  { name: "Goat", img: goat, href: "/products" },
  { name: "Crops", img: crops, href: "/products" },
];

const reasons = [
  { icon: BadgeCheck, title: "Trusted source", desc: "Registered company with verified farm & supplier network." },
  { icon: ShieldCheck, title: "Quality first", desc: "Clear specs and careful handling before listing." },
  { icon: Headset, title: "Real support", desc: "Phone & WhatsApp help before and after your order." },
  { icon: Sparkles, title: "Growing catalogue", desc: "New local & international products added regularly." },
];

const HomeExtras = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("categories").select("id,name,slug,image_url").order("sort_order").limit(8),
        supabase.from("products").select("id,name,price,sale_price,images,unit,featured").eq("is_active", true).order("featured", { ascending: false }).limit(8),
      ]);
      setCategories((c.data as Category[]) ?? []);
      setFeatured((p.data as unknown as Product[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-background">
      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Shop by category</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">Farm-fresh dairy, meat, poultry and crops</p>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            All products <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.length > 0
            ? categories.map((c) => (
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
              ))
            : fallbackCats.map((c) => (
                <Link
                  key={c.name}
                  to={c.href}
                  className="group relative rounded-2xl overflow-hidden border border-border aspect-[4/3]"
                >
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <span className="font-display font-bold text-white">{c.name}</span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Featured products</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">Popular picks from our marketplace</p>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            View all <ArrowRight size={14} />
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

      {/* Why us */}
      <section className="border-y border-border bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Why eKharayo</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <Icon className="text-primary" size={22} />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">{title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-7 py-3.5 rounded-lg hover:bg-green-glow transition-colors"
            >
              Start shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeExtras;
