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
import { Banknote, Check, Loader2, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentId = "cod" | "esewa" | "khalti" | "fonepay" | "imepay";

/** Clean square brand icons (exact logos — no broken Lovable asset paths). */
const PAYMENT_LOGOS: Record<Exclude<PaymentId, "cod">, string> = {
  esewa: "https://www.google.com/s2/favicons?domain=esewa.com.np&sz=128",
  khalti: "https://www.google.com/s2/favicons?domain=khalti.com&sz=128",
  fonepay: "https://www.google.com/s2/favicons?domain=fonepay.com&sz=128",
  imepay: "https://www.google.com/s2/favicons?domain=imepay.com.np&sz=128",
};

const paymentMethods: { id: PaymentId; name: string; logo?: string }[] = [
  { id: "cod", name: "Cash on Delivery" },
  { id: "esewa", name: "eSewa", logo: PAYMENT_LOGOS.esewa },
  { id: "khalti", name: "Khalti", logo: PAYMENT_LOGOS.khalti },
  { id: "fonepay", name: "Fonepay", logo: PAYMENT_LOGOS.fonepay },
  { id: "imepay", name: "IME Pay", logo: PAYMENT_LOGOS.imepay },
];

const defaultPayments: Record<PaymentId, boolean> = { cod: true, esewa: false, khalti: false, fonepay: false, imepay: false };

const Checkout = () => {
  const { items, subtotal, coupon, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [payments, setPayments] = useState<Record<PaymentId, boolean>>(defaultPayments);
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
    const email = user?.email;
    if (email) setForm((f) => ({ ...f, customer_email: f.customer_email || email }));
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
    supabase.from("site_settings").select("value").eq("key", "payments").maybeSingle().then(({ data }) => {
      const v = data?.value as Partial<Record<PaymentId, boolean>> | undefined;
      setPayments({ ...defaultPayments, ...(v ?? {}) });
    });
  }, []);

  useEffect(() => {
    if (items.length === 0 && !busy) navigate("/cart", { replace: true });
  }, [items.length, busy, navigate]);

  const savings = couponSavings(coupon, subtotal);
  const effectiveDelivery = savings.freeShipping ? 0 : deliveryFee;
  const discount = Number(savings.discount || 0);
  const total = Math.max(subtotal + effectiveDelivery + tax - discount, 0);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error("Current location is not supported on this device");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setForm((current) => ({ ...current, address_line: `GPS: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` })),
      (error) => toast.error(error.message || "Could not access your location"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

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
                <input required placeholder="Phone number" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={field} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Shipping address</h2>
              <input required placeholder="Street address, tole, ward" value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className={field} />
              <input placeholder="Nearby landmark (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={field} />
              <Button type="button" variant="outline" onClick={useCurrentLocation}><MapPin size={16} /> Use Current Location</Button>

              <h2 className="font-display text-xl font-bold text-foreground pt-2">Payment method</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const available = payments[method.id];
                  return (
                    <button
                      key={method.id}
                      type="button"
                      disabled={!available}
                      onClick={() => setForm({ ...form, payment_method: method.id })}
                      className={`min-h-24 text-left border rounded-lg p-4 transition-colors ${
                        available && form.payment_method === method.id
                          ? "border-primary bg-primary/10"
                          : available
                          ? "border-border bg-card hover:border-primary/40"
                          : "border-border bg-muted/40 opacity-65 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {method.id === "cod" ? (
                          <span className="inline-flex items-center gap-1.5 h-10 px-2.5 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                            <Banknote size={18} /> COD
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-border/60 shadow-sm overflow-hidden shrink-0">
                            <img
                              src={method.logo}
                              alt={`${method.name} logo`}
                              className="h-7 w-7 object-contain"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </span>
                        )}
                        {available ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary"><Check size={13} /> Available</span>
                          ) : (
                          <span className="rounded-full bg-accent/15 text-accent px-2 py-1 text-[10px] uppercase font-bold">Coming Soon</span>
                        )}
                      </div>
                      <span className="flex items-center gap-2 mt-3 font-semibold text-sm">{method.name}</span>
                    </button>
                  );
                })}
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
