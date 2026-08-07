import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { rs } from "@/lib/media";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  images: string[];
  unit: string | null;
  stock: number;
}

const Wishlist = () => {
  const { user, openAuthModal } = useAuth();
  const { ids, toggle, ready } = useWishlist();
  const { add } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user || ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("products")
      .select("id,name,price,sale_price,images,unit,stock")
      .in("id", ids)
      .then(({ data }) => {
        setProducts((data as unknown as Product[]) ?? []);
        setLoading(false);
      });
  }, [ids, ready, user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-14">
        <Navbar />
        <PageShell title="Wishlist" subtitle="Save products you love">
          <div className="container mx-auto px-4 py-16 text-center">
            <Heart className="mx-auto text-muted-foreground mb-4" size={36} />
            <p className="font-body text-muted-foreground mb-4">Sign in to view your wishlist</p>
            <Button onClick={() => openAuthModal("/wishlist")}>Sign in</Button>
          </div>
        </PageShell>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Wishlist" subtitle="Products you saved for later">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="mx-auto text-muted-foreground mb-4" size={36} />
              <p className="font-body text-muted-foreground mb-4">Your wishlist is empty</p>
              <Link to="/products" className="text-primary font-semibold hover:underline">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                  <Link to={`/products/${p.id}`} className="shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-20 h-20 rounded-lg object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${p.id}`} className="font-display font-bold text-foreground hover:text-primary truncate block">
                      {p.name}
                    </Link>
                    <p className="font-body text-sm text-primary font-semibold">
                      {rs(Number(p.sale_price ?? p.price))}
                      {p.unit ? ` / ${p.unit}` : ""}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={p.stock <= 0}
                        onClick={() =>
                          add({
                            id: p.id,
                            name: p.name,
                            price: Number(p.sale_price ?? p.price),
                            image: p.images?.[0] ?? null,
                            unit: p.unit,
                          })
                        }
                      >
                        <ShoppingCart size={14} /> Cart
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggle(p.id)}>
                        Remove
                      </Button>
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

export default Wishlist;
