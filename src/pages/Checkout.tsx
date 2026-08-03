import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: user?.email ?? "",
    customer_phone: "",
    address_line: "",
    city: "",
    district: "",
    notes: "",
    payment_method: "cod",
  });

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, customer_email: f.customer_email || user.email! }));
  }, [user]);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "store").maybeSingle().then(({ data }) => {
      const v = data?.value as { delivery_fee?: number } | undefined;
      setDeliveryFee(Number(v?.delivery_fee ?? 0));
    });
  }, []);

  useEffect(() => {
    if (items.length === 0 && !busy) navigate("/cart", { replace: true });
  }, [items.length, busy, navigate]);

  const total = subtotal + deliveryFee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ ...form, user_id: user.id, subtotal, delivery_fee: deliveryFee, total })
      .select()
      .single();

    if (error || !order) {
      setBusy(false);
      return toast.error(error?.message ?? "Could not place order");
    }

    const { error: itemErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        image_url: i.image,
        unit_price: i.price,
        quantity: i.quantity,
        line_total: i.price * i.quantity,
      })),
    );
    if (itemErr) {
      setBusy(false);
      return toast.error(itemErr.message);
    }

    clear();
    navigate(`/order-confirmation/${order.id}`, { replace: true });
  };

  const field = "w-full border border-border rounded-lg px-4 py-3 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Checkout" subtitle="Confirm your details and place your order">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 max-w-5xl mx-auto">
            <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-8 space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">Customer details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input required placeholder="Full name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={field} />
                <input required type="email" placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={field} />
                <input required placeholder="Phone number" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={field} />
                <input required placeholder="City / Town" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={field} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Shipping address</h2>
              <input required placeholder="Street address, tole, ward" value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className={field} />
              <input placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={field} />
              <textarea rows={3} placeholder="Delivery notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${field} resize-none`} />

              <h2 className="font-display text-xl font-bold text-foreground pt-2">Payment</h2>
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className={field}>
                <option value="cod">Cash on delivery</option>
                <option value="bank">Bank transfer</option>
              </select>

              <button disabled={busy} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-4 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
                {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Place order
              </button>
            </form>

            <aside className="bg-card border border-border rounded-2xl p-6 h-fit">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Order summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between gap-3 font-body text-sm">
                    <span className="text-muted-foreground">{i.name} × {i.quantity}</span>
                    <span className="text-foreground">{rs(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 font-body text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{rs(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-foreground">{rs(deliveryFee)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border"><span className="font-semibold text-foreground">Total</span><span className="font-display text-lg font-bold text-primary">{rs(total)}</span></div>
              </div>
            </aside>
          </div>
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Checkout;
