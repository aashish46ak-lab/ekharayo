import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { rs } from "@/lib/media";
import { ShoppingCart, Loader2, PackageX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface Category { id: string; name: string; slug: string; image_url: string | null; sort_order: number }
interface Product {
  id: string; name: string; description: string | null; price: number; sale_price: number | null;
  stock: number; unit: string | null; images: string[]; featured: boolean; category_id: string | null;
}

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("products").select("*").eq("is_active", true).order("created_at"),
      ]);
      setCategories((c.data as Category[]) ?? []);
      setProducts((p.data as unknown as Product[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const addToCart = (p: Product) => {
    if (p.stock <= 0) return toast.error("This product is out of stock");
    add({ id: p.id, name: p.name, price: Number(p.sale_price ?? p.price), image: p.images?.[0] ?? null, unit: p.unit ?? undefined });
    toast.success(`${p.name} added to cart`);
  };

  const buyNow = (p: Product) => {
    if (p.stock <= 0) return toast.error("This product is out of stock");
    if (!user) return openAuthModal("/products");
    localStorage.setItem("ekharayo-cart", JSON.stringify([{ id: p.id, name: p.name, price: Number(p.sale_price ?? p.price), image: p.images?.[0] ?? null, unit: p.unit, quantity: 1 }]));
    window.location.assign("/checkout");
  };

  const uncategorised = products.filter((p) => !p.category_id);

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Our Products" subtitle="Farm-fresh dairy, meat, and crops delivered to your doorstep">
        <div className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div>
          ) : (
            <div className="space-y-16">
              {[...categories.map((c) => ({ cat: c, list: products.filter((p) => p.category_id === c.id) })),
                ...(uncategorised.length ? [{ cat: null as Category | null, list: uncategorised }] : [])]
                .filter((g) => g.list.length > 0)
                .map((g) => (
                  <div key={g.cat?.id ?? "other"}>
                    <div className="flex items-center gap-4 mb-8">
                      {g.cat?.image_url && (
                        <img src={g.cat.image_url} alt={g.cat.name} loading="lazy" className="w-16 h-16 rounded-xl object-cover shadow-md ring-2 ring-primary/30" />
                      )}
                      <h2 className="font-display text-2xl font-bold text-foreground">{g.cat?.name ?? "More Products"}</h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {g.list.map((p) => (
                        <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-44 object-cover" />
                          ) : (
                            <div className="w-full h-44 bg-muted flex items-center justify-center"><PackageX className="text-muted-foreground" size={28} /></div>
                          )}
                          <div className="p-6">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-display text-lg font-bold text-foreground">{p.name}</h3>
                              {p.featured && <span className="font-body text-[10px] uppercase tracking-wide bg-accent/15 text-accent px-2 py-1 rounded-full">Featured</span>}
                            </div>
                            <p className="font-body text-sm text-muted-foreground mb-3">{p.description}</p>
                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="font-body text-lg font-bold text-primary">{rs(Number(p.sale_price ?? p.price))}</span>
                              {p.sale_price != null && <span className="font-body text-sm text-muted-foreground line-through">{rs(Number(p.price))}</span>}
                              {p.unit && <span className="font-body text-xs text-muted-foreground">/ {p.unit}</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" onClick={() => addToCart(p)} disabled={p.stock <= 0}><ShoppingCart size={16} /> {p.stock > 0 ? "Add to Cart" : "Out of stock"}</Button>
                              <Button onClick={() => buyNow(p)} disabled={p.stock <= 0}>Buy Now</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Products;
