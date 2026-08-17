import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import ProductReviews from "@/components/ProductReviews";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { isVideoUrl, rs } from "@/lib/media";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Minus, PackageX, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgIdx(0);
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
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
      } else setRelated([]);
      setLoading(false);
    })();
  }, [id]);

  const media = product?.images?.filter(Boolean) ?? [];
  const current = media[imgIdx] ?? null;
  const price = Number(product?.sale_price ?? product?.price ?? 0);

  const addToCart = () => {
    if (!product || product.stock <= 0) return toast.error("Out of stock");
    const cover = media.find((u) => !isVideoUrl(u)) ?? media[0] ?? null;
    add({ id: product.id, name: product.name, price, image: cover, unit: product.unit ?? undefined }, qty);
    toast.success("Added to cart");
  };

  const buyNow = () => {
    if (!product || product.stock <= 0) return toast.error("Out of stock");
    if (!user) return openAuthModal(`/products/${product.id}`);
    const cover = media.find((u) => !isVideoUrl(u)) ?? media[0] ?? null;
    add({ id: product.id, name: product.name, price, image: cover, unit: product.unit ?? undefined }, qty);
    navigate("/checkout");
  };

  const prev = () => setImgIdx((i) => (media.length ? (i - 1 + media.length) % media.length : 0));
  const next = () => setImgIdx((i) => (media.length ? (i + 1) % media.length : 0));

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-body text-sm mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : !product ? (
          <div className="text-center py-24">
            <PackageX className="mx-auto text-muted-foreground mb-3" size={36} />
            <p className="font-body text-muted-foreground mb-4">Product not found</p>
            <Link to="/products" className="text-primary font-semibold hover:underline">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div>
                <div className="relative rounded-2xl border border-border overflow-hidden bg-muted aspect-square group">
                  {current ? (
                    isVideoUrl(current) ? (
                      <video key={current} src={current} controls playsInline className="w-full h-full object-contain bg-black" />
                    ) : (
                      <img src={current} alt={product.name} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PackageX className="text-muted-foreground" size={40} />
                    </div>
                  )}
                  {media.length > 1 && (
                    <>
                      <button type="button" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/90 border border-border text-foreground opacity-80 hover:opacity-100" aria-label="Previous">
                        <ChevronLeft size={18} />
                      </button>
                      <button type="button" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/90 border border-border text-foreground opacity-80 hover:opacity-100" aria-label="Next">
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>
                {media.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {media.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setImgIdx(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border shrink-0 relative ${i === imgIdx ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                      >
                        {isVideoUrl(src) ? (
                          <>
                            <video src={src} muted className="w-full h-full object-cover" />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-[10px] font-bold text-white">VIDEO</span>
                          </>
                        ) : (
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{product.name}</h1>
                  {product.featured && <span className="shrink-0 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-bold px-2 py-1 uppercase">Featured</span>}
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-2xl font-bold text-primary">{rs(price)}</span>
                  {product.sale_price != null && Number(product.sale_price) < Number(product.price) && (
                    <span className="text-sm text-muted-foreground line-through">{rs(Number(product.price))}</span>
                  )}
                  {product.unit && <span className="text-sm text-muted-foreground">/ {product.unit}</span>}
                </div>
                <p className={`font-body text-sm mb-4 ${product.stock > 0 ? "text-primary" : "text-destructive"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </p>
                {product.description && <p className="font-body text-sm text-foreground/80 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>}

                <div className="flex items-center gap-3 mb-4">
                  <span className="font-body text-sm text-muted-foreground">Qty</span>
                  <div className="flex items-center gap-2 border border-border rounded-lg">
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 hover:bg-muted" aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span className="font-body text-sm w-8 text-center">{qty}</span>
                    <button type="button" onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="p-2 hover:bg-muted" aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Button variant="outline" onClick={addToCart} disabled={product.stock <= 0}>
                    <ShoppingCart size={16} /> Add to Cart
                  </Button>
                  <Button onClick={buyNow} disabled={product.stock <= 0}>
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mb-8">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">Related products</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {related.map((r) => {
                    const thumb = r.images?.find((u) => !isVideoUrl(u)) ?? r.images?.[0];
                    return (
                      <Link key={r.id} to={`/products/${r.id}`} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all">
                        {thumb && !isVideoUrl(thumb) ? (
                          <img src={thumb} alt={r.name} className="w-full h-28 object-cover" />
                        ) : (
                          <div className="w-full h-28 bg-muted" />
                        )}
                        <div className="p-3">
                          <p className="font-display font-semibold text-sm text-foreground truncate">{r.name}</p>
                          <p className="font-body text-sm text-primary font-bold">{rs(Number(r.sale_price ?? r.price))}</p>
                        </div>
                      </Link>
                    );
                  })}
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
