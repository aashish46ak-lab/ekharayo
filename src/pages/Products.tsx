import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { rs } from "@/lib/media";
import { Heart, Loader2, PackageX, ShoppingCart } from "lucide-react";
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
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const [q, setQ] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "name">("newest");
  const { add } = useCart();
  const { user, openAuthModal } = useAuth();
  const { has, toggle } = useWishlist();

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      setCategories((c.data as Category[]) ?? []);
      setProducts((p.data as unknown as Product[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (activeCat !== "all" && p.category_id !== activeCat) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (!term) return true;
      return p.name.toLowerCase().includes(term) || (p.description ?? "").toLowerCase().includes(term);
    });
    list = [...list].sort((a, b) => {
      const pa = Number(a.sale_price ?? a.price);
      const pb = Number(b.sale_price ?? b.price);
      if (sortBy === "price_asc") return pa - pb;
      if (sortBy === "price_desc") return pb - pa;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [products, activeCat, q, inStockOnly, sortBy]);

  const addToCart = (p: Product) => {
    if (p.stock <= 0) return toast.error("This product is out of stock");
    add({ id: p.id, name: p.name, price: Number(p.sale_price ?? p.price), image: p.images?.[0] ?? null, unit: p.unit ?? undefined });
  };

  const buyNow = (p: Product) => {
    if (p.stock <= 0) return toast.error("This product is out of stock");
    if (!user) return openAuthModal("/products");
    localStorage.setItem(
      "ekharayo-cart",
      JSON.stringify([{ id: p.id, name: p.name, price: Number(p.sale_price ?? p.price), image: p.images?.[0] ?? null, unit: p.unit, quantity: 1 }]),
    );
    window.location.assign("/checkout");
  };

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Our Products" subtitle="Farm-fresh dairy, meat, and crops delivered to your doorstep">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter products…"
              className="flex-1 border border-border rounded-lg px-4 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <label className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground px-2">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="rounded border-border" />
              In stock only
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mb-10">
            <button type="button" onClick={() => setActiveCat("all")} className={`px-3 py-1.5 rounded-full font-body text-xs font-medium border transition-colors ${activeCat === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>All</button>
            {categories.map((c) => (
              <button key={c.id} type="button" onClick={() => setActiveCat(c.id)} className={`px-3 py-1.5 rounded-full font-body text-xs font-medium border transition-colors ${activeCat === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>{c.name}</button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <PackageX className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="font-body text-muted-foreground">No products match your filters.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 relative">
                  <button type="button" onClick={() => toggle(p.id)} className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-card/90 border border-border ${has(p.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`} aria-label="Wishlist">
                    <Heart size={16} className={has(p.id) ? "fill-current" : ""} />
                  </button>
                  <Link to={`/products/${p.id}`}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-muted flex items-center justify-center"><PackageX className="text-muted-foreground" size={28} /></div>
                    )}
                  </Link>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link to={`/products/${p.id}`} className="font-display text-lg font-bold text-foreground hover:text-primary">{p.name}</Link>
                      {p.featured && <span className="font-body text-[10px] uppercase tracking-wide bg-accent/15 text-accent px-2 py-1 rounded-full shrink-0">Featured</span>}
                    </div>
                    <p className="font-body text-sm text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                    <p className="font-body text-xs mb-3">
                      {p.stock > 0 ? (p.stock <= 5 ? <span className="text-accent">Only {p.stock} left</span> : <span className="text-primary">In stock</span>) : <span className="text-destructive">Out of stock</span>}
                    </p>
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
          )}
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Products;
