import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { productCover } from "@/lib/productImages";
import { rs } from "@/lib/media";
import { ArrowRight, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  unit: string | null;
  images: string[];
  featured: boolean;
}

const FeaturedProducts = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,price,sale_price,unit,images,featured")
        .eq("is_active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      setItems((data as unknown as Product[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <section className="py-12 flex justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Shop bestsellers</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">Fresh from Itahari — temporary photos until your uploads</p>
        </div>
        <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((p) => {
          const price = Number(p.sale_price ?? p.price);
          const img = productCover(p.images, p.name);
          return (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all group"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-2.5 sm:p-3">
                <p className="font-display font-semibold text-xs sm:text-sm text-foreground line-clamp-2">{p.name}</p>
                <p className="font-body text-sm font-bold text-primary mt-1">
                  {rs(price)}
                  {p.unit ? <span className="text-[10px] font-normal text-muted-foreground"> / {p.unit}</span> : null}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link to="/products" className="inline-flex items-center gap-1 text-primary font-body text-sm font-semibold">
          View all products <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
