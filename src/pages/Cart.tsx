import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { useCart } from "@/hooks/useCart";
import { rs } from "@/lib/media";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, setQty, remove, subtotal } = useCart();

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Your Cart" subtitle="Review your items before checkout">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto text-muted-foreground mb-4" size={40} />
              <p className="font-body text-muted-foreground mb-6">Your cart is empty.</p>
              <Link to="/products" className="inline-flex bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-lg hover:bg-green-glow transition-colors">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                  {i.image ? (
                    <img src={i.image} alt={i.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-foreground truncate">{i.name}</p>
                    <p className="font-body text-sm text-muted-foreground">{rs(i.price)}{i.unit ? ` / ${i.unit}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(i.id, i.quantity - 1)} aria-label="Decrease" className="p-1.5 rounded-md border border-border text-foreground hover:border-primary/40"><Minus size={14} /></button>
                    <span className="font-body text-sm w-6 text-center text-foreground">{i.quantity}</span>
                    <button onClick={() => setQty(i.id, i.quantity + 1)} aria-label="Increase" className="p-1.5 rounded-md border border-border text-foreground hover:border-primary/40"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => remove(i.id)} aria-label="Remove" className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}

              <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
                <span className="font-body text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl font-bold text-primary">{rs(subtotal)}</span>
              </div>

              <Link to="/checkout" className="w-full flex items-center justify-center bg-primary text-primary-foreground font-body font-semibold py-4 rounded-lg hover:bg-green-glow transition-colors">
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Cart;
