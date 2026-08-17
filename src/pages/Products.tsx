import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { productCover } from "@/lib/productImages";
import { rs } from "@/lib/media";
import { Heart, Loader2, PackageX, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
}
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  unit: string | null;
  images: string[];
  featured: boolean;
  category_id: string | null;
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
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      const prods = (p.data as unknown as Product[]) ?? [];
      const cats = (c.data as Category[]) ?? [];
      const nonEmpty = cats.filter((cat) => prods.some((pr) => pr.category_id === cat.id));
      setCategories(nonEmpty);
      setProducts(prods);
      setLoading(false);
    })();
  }, []);

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "";

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
    const img = productCover(p.images, p.name, catName(p.category_id));
    add({ id: p.id, name: p.name, price: Number(p.sale_price ?? p.price), image: img, unit: p.unit ?? undefined });
    toast.success("Added to cart");
  };

  const buyNow = (p: Product) => {
    if (p.stock <= 0) return toast.error("This product is out of stock");
    if (!user) return openAuthModal("/checkout");
    const img = productCover(p.images, p.name, catName(p.category_id));
    add({ id: p.id, name: p.name, price: Number(p.sale_price ?? p.price), image: img, unit: p.unit ?? undefined });
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Our Products" subtitle="Farm-fresh dairy, meat, and crops delivered to your doorstep">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="flex flex-col gap-3 mb-6">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name (e.g. milk, ghee, dahi)…"
              className="w-full border border-border rounded-lg px-4 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="rounded border-border" />
                In stock only
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-border rounded-lg px-3 py-2 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveCat("all")}
              className={`px-3 py-1.5 rounded-full font-body text-xs font-medium border transition-colors ${
                activeCat === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(c.id)}
                className={`px-3 py-1.5 rounded-full font-body text-xs font-medium border transition-colors ${
                  activeCat === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <PackageX className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="font-body text-muted-foreground">No products match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto lg:max-w-4xl">
              {filtered.map((p) => {
                const price = Number(p.sale_price ?? p.price);
                const hasSale = p.sale_price != null && Number(p.sale_price) < Number(p.price);
                const img = productCover(p.images, p.name, catName(p.category_id));
                return (
                  <div
                    key={p.id}
                    className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col"
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card/90 border border-border ${
                          has(p.id) ? "text-primary" : "text-muted-foreground"
                        }`}
                        aria-label="Wishlist"
                      >
                        <Heart size={14} className={has(p.id) ? "fill-current" : ""} />
                      </button>
                      {p.featured && (
                        <span className="absolute top-2 left-2 z-10 rounded-full bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
                          Featured
                        </span>
                      )}
                      <Link to={`/products/${p.id}`} className="block aspect-[4/3] bg-muted">
                        <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                      </Link>
                    </div>

                    <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1">
                      <Link to={`/products/${p.id}`} className="font-display font-semibold text-xs sm:text-sm text-foreground line-clamp-2 hover:text-primary leading-snug">
                        {p.name}
                      </Link>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-display text-sm sm:text-base font-bold text-primary">{rs(price)}</span>
                        {hasSale && <span className="text-[10px] text-muted-foreground line-through">{rs(Number(p.price))}</span>}
                        {p.unit && <span className="text-[10px] text-muted-foreground">/ {p.unit}</span>}
                      </div>
                      <p className={`font-body text-[10px] ${p.stock > 0 ? "text-primary" : "text-destructive"}`}>
                        {p.stock > 0 ? "In stock" : "Out of stock"}
                      </p>
                      <div className="mt-auto grid grid-cols-1 gap-1.5 pt-1">
                        <Button type="button" variant="outline" size="sm" disabled={p.stock <= 0} onClick={() => addToCart(p)} className="h-8 text-[11px] sm:text-xs w-full">
                          <ShoppingCart size={13} /> Add to cart
                        </Button>
                        <Button type="button" size="sm" disabled={p.stock <= 0} onClick={() => buyNow(p)} className="h-8 text-[11px] sm:text-xs w-full">
                          <Zap size={13} /> Buy now
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
