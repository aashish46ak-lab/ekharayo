import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import ProductReviews from "@/components/ProductReviews";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { rs } from "@/lib/media";
import { ArrowLeft, Heart, Loader2, Minus, PackageX, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user, openAuthModal } = useAuth();
  const { has, toggle } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQty(1);
    setImgIdx(0);
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).eq("is_active", true).maybeSingle();
      const p = data as unknown as Product | null;
      setProduct(p);
      if (p?.category_id) {
        const { data: rel } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("category_id", p.category_id)
          .neq("id", p.id)
          .limit(4);
        setRelated((rel as unknown as Product[]) ?? []);
      } else {
        setRelated([]);
      }
      setLoading(false);
    })();
  }, [id]);

  const price = Number(product?.sale_price ?? product?.price ?? 0);

  const addToCart = () => {
    if (!product) return;
    if (product.stock <= 0) return toast.error("Out of stock");
    add({ id: product.id, name: product.name, price, image: product.images?.[0] ?? null, unit: product.unit }, qty);
  };

  const buyNow = () => {
    if (!product || product.stock <= 0) return toast.error("Out of stock");
    if (!user) return openAuthModal(`/products/${product.id}`);
    add({ id: product.id, name: product.name, price, image: product.images?.[0] ?? null, unit: product.unit }, qty);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-body text-sm mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : !product ? (
          <div className="text-center py-24">
            <PackageX className="mx-auto text-muted-foreground mb-3" size={36} />
            <p className="font-body text-muted-foreground mb-4">Product not found</p>
            <Link to="/products" className="text-primary font-semibold hover:underline">Browse products</Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div>
                <div className="rounded-2xl border border-border overflow-hidden bg-muted aspect-square">
                  {product.images?.[imgIdx] ? (
                    <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><PackageX className="text-muted-foreground" size={40} /></div>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {product.images.map((src, i) => (
                      <button key={src} type="button" onClick={() => setImgIdx(i)} className={`w-16 h-16 rounded-lg overflow-hidden border shrink-0 ${i === imgIdx ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
                  <button type="button" onClick={() => toggle(product.id)} className={`p-2 rounded-full border transition-colors ${has(product.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-primary"}`} aria-label="Wishlist">
                    <Heart size={18} className={has(product.id) ? "fill-current" : ""} />
                  </button>
                </div>
                {product.featured && <span className="w-fit font-body text-[10px] uppercase tracking-wide bg-accent/15 text-accent px-2 py-1 rounded-full mb-3">Featured</span>}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-display text-2xl font-bold text-primary">{rs(price)}</span>
                  {product.sale_price != null && <span className="font-body text-sm text-muted-foreground line-through">{rs(Number(product.price))}</span>}
                  {product.unit && <span className="font-body text-sm text-muted-foreground">/ {product.unit}</span>}
                </div>
                <p className="font-body text-sm text-muted-foreground mb-2">
                  {product.stock > 0 ? (product.stock <= 5 ? <span className="text-accent font-medium">Only {product.stock} left in stock</span> : <span className="text-primary">In stock ({product.stock} available)</span>) : <span className="text-destructive">Out of stock</span>}
                </p>
                {product.description && <p className="font-body text-sm text-foreground/80 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>}

                <div className="flex items-center gap-3 mb-4">
                  <span className="font-body text-sm text-muted-foreground">Qty</span>
                  <div className="flex items-center gap-2 border border-border rounded-lg">
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 hover:bg-muted" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="font-body text-sm w-8 text-center">{qty}</span>
                    <button type="button" onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="p-2 hover:bg-muted" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Button variant="outline" onClick={addToCart} disabled={product.stock <= 0}><ShoppingCart size={16} /> Add to Cart</Button>
                  <Button onClick={buyNow} disabled={product.stock <= 0}>Buy Now</Button>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mb-8">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">Related products</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {related.map((r) => (
                    <Link key={r.id} to={`/products/${r.id}`} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                      {r.images?.[0] ? <img src={r.images[0]} alt={r.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-muted" />}
                      <div className="p-3">
                        <p className="font-display font-semibold text-sm text-foreground truncate">{r.name}</p>
                        <p className="font-body text-sm text-primary font-bold">{rs(Number(r.sale_price ?? r.price))}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <ProductReviews productId={product.id} />
          </>
        )}
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default ProductDetail;
