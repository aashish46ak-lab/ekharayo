import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { couponSavings } from "@/lib/commerce";
import { rs } from "@/lib/media";
import { toast } from "sonner";
import { Banknote, Check, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const paymentMethods = [
  { id: "cod", name: "Cash on Delivery", label: "COD", available: true },
  { id: "esewa", name: "eSewa", label: "eSewa", available: false },
  { id: "khalti", name: "Khalti", label: "Khalti", available: false },
  { id: "fonepay", name: "Fonepay", label: "Fonepay", available: false },
  { id: "imepay", name: "IME Pay", label: "IME Pay", available: false },
] as const;

const Checkout = () => {
  const { items, subtotal, coupon, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: user?.email ?? "",
    customer_phone: "",
    alt_phone: "",
    address_line: "",
    city: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    postal_code: "",
    notes: "",
    delivery_method: "standard",
    payment_method: "cod",
  });

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, customer_email: f.customer_email || user.email! }));
  }, [user]);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "store").maybeSingle().then(({ data }) => {
      const v = data?.value as { delivery_fee?: number } | undefined;
      const fee = Number(v?.delivery_fee ?? 0);
      const taxRate = Number((v as { tax_rate?: number } | undefined)?.tax_rate ?? 0);
      setDeliveryFee(Number.isFinite(fee) ? Math.max(fee, 0) : 0);
      setTax(Number.isFinite(taxRate) ? Math.max((subtotal * taxRate) / 100, 0) : 0);
    });
  }, [subtotal]);

  useEffect(() => {
    if (items.length === 0 && !busy) navigate("/cart", { replace: true });
  }, [items.length, busy, navigate]);

  const savings = couponSavings(coupon, subtotal);
  const effectiveDelivery = savings.freeShipping ? 0 : deliveryFee;
  const discount = Number(savings.discount || 0);
  const total = Math.max(subtotal + effectiveDelivery + tax - discount, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0 || total <= 0) return toast.error("Please review your cart before placing this order");
    setBusy(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        ...form,
        user_id: user.id,
        subtotal: Number(subtotal),
        delivery_fee: Number(effectiveDelivery),
        shipping_charge: 0,
        discount,
        tax: Number(tax),
        total: Number(total),
        coupon_code: coupon?.code ?? null,
      })
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
            <form onSubmit={submit} className="bg-card border border-border rounded-lg p-5 sm:p-8 space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">Customer details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input required placeholder="Full name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={field} />
                <input required type="email" placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={field} />
                <input required placeholder="Phone number" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={field} />
                <input placeholder="Alternate phone (optional)" value={form.alt_phone} onChange={(e) => setForm({ ...form, alt_phone: e.target.value })} className={field} />
                <input required placeholder="City / Town" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={field} />
                <input required placeholder="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className={field} />
                <input required placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={field} />
                <input required placeholder="Municipality" value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} className={field} />
                <input required placeholder="Ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} className={field} />
                <input placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className={field} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Shipping address</h2>
              <input required placeholder="Street address, tole, ward" value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className={field} />
              <textarea rows={3} placeholder="Delivery notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${field} resize-none`} />

              <h2 className="font-display text-xl font-bold text-foreground pt-2">Payment method</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button key={method.id} type="button" disabled={!method.available} onClick={() => setForm({ ...form, payment_method: method.id })} className={`min-h-24 text-left border rounded-lg p-4 transition-colors ${method.available ? "border-primary bg-primary/10" : "border-border bg-muted/40 opacity-65 cursor-not-allowed"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex h-8 px-2 items-center rounded-md bg-background border border-border font-bold text-sm">{method.label}</span>
                      {method.available ? <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary"><Check size={13} /> Available</span> : <span className="rounded-full bg-accent/15 text-accent px-2 py-1 text-[10px] uppercase font-bold">Coming Soon</span>}
                    </div>
                    <span className="flex items-center gap-2 mt-3 font-semibold">{method.id === "cod" ? <Banknote size={16} /> : <CreditCard size={16} />}{method.name}</span>
                  </button>
                ))}
              </div>

              <Button disabled={busy} className="w-full h-14 font-semibold">
                {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Place order
              </Button>
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
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-foreground">{effectiveDelivery ? rs(effectiveDelivery) : "Free"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="text-foreground">{rs(tax)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-foreground">− {rs(discount)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border"><span className="font-semibold text-foreground">Grand Total</span><span className="font-display text-lg font-bold text-primary">{rs(total)}</span></div>
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
