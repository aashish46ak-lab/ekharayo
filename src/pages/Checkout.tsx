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
import { computeDeliveryFee, DEFAULT_DELIVERY, type DeliveryTierConfig } from "@/lib/delivery";
import { queueOrderNotification } from "@/lib/notifications";
import { rs } from "@/lib/media";
import { toast } from "sonner";
import { Banknote, Check, Loader2, ShieldCheck, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import esewaLogo from "@/assets/payment/esewa.svg";
import khaltiLogo from "@/assets/payment/khalti.svg";
import fonepayLogo from "@/assets/payment/fonepay.svg";
import imepayLogo from "@/assets/payment/imepay.svg";

type PaymentId = "cod" | "esewa" | "khalti" | "fonepay" | "imepay";

const paymentMethods: { id: PaymentId; name: string; logo?: string }[] = [
  { id: "cod", name: "Cash on Delivery" },
  { id: "esewa", name: "eSewa", logo: esewaLogo },
  { id: "khalti", name: "Khalti", logo: khaltiLogo },
  { id: "fonepay", name: "Fonepay", logo: fonepayLogo },
  { id: "imepay", name: "IME Pay", logo: imepayLogo },
];

const defaultPayments: Record<PaymentId, boolean> = { cod: true, esewa: false, khalti: false, fonepay: false, imepay: false };

const Checkout = () => {
  const { items, subtotal, coupon, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [tax, setTax] = useState(0);
  const [payments, setPayments] = useState<Record<PaymentId, boolean>>(defaultPayments);
  const [deliveryCfg, setDeliveryCfg] = useState<DeliveryTierConfig>(DEFAULT_DELIVERY);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState(() => computeDeliveryFee(0, null, null));
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
    supabase.from("site_settings").select("key,value").in("key", ["store", "payments", "delivery_zones"]).then(({ data }) => {
      const map: Record<string, unknown> = {};
      (data ?? []).forEach((r) => { map[r.key] = r.value; });
      const store = map.store as { tax_rate?: number } | undefined;
      const taxRate = Number(store?.tax_rate ?? 0);
      setTax(Number.isFinite(taxRate) ? Math.max((subtotal * taxRate) / 100, 0) : 0);
      const pay = map.payments as Partial<Record<PaymentId, boolean>> | undefined;
      setPayments({ ...defaultPayments, ...(pay ?? {}) });
      const zones = map.delivery_zones as DeliveryTierConfig | undefined;
      if (zones?.hq?.lat && zones.tiers?.length) setDeliveryCfg({ ...DEFAULT_DELIVERY, ...zones });
    });
  }, [subtotal]);

  useEffect(() => {
    const info = computeDeliveryFee(subtotal, coords?.lat ?? null, coords?.lng ?? null, deliveryCfg);
    const savings = couponSavings(coupon, subtotal);
    if (savings.freeShipping) setDeliveryInfo({ ...info, fee: 0, free: true, label: "Free shipping (coupon)" });
    else setDeliveryInfo(info);
  }, [subtotal, coords, deliveryCfg, coupon]);

  useEffect(() => {
    if (items.length === 0 && !busy) navigate("/cart", { replace: true });
  }, [items.length, busy, navigate]);

  const savings = couponSavings(coupon, subtotal);
  const effectiveDelivery = deliveryInfo.fee;
  const discount = Number(savings.discount || 0);
  const total = Math.max(subtotal + effectiveDelivery + tax - discount, 0);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error("Current location is not supported on this device");
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setForm((current) => ({
          ...current,
          address_line: current.address_line || `GPS: ${c.latitude.toFixed(6)}, ${c.longitude.toFixed(6)}`,
        }));
        toast.success("Location set — delivery fee updated from Morang HQ");
      },
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

    await queueOrderNotification({
      orderId: order.id,
      userId: user.id,
      email: form.customer_email || user.email,
      orderNumber: (order as { order_number?: string }).order_number || order.id.slice(0, 8),
      event: "order_placed",
      total: Number(total),
    });

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
              <input type="email" placeholder="Email (for order updates)" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={field} />
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Shipping address</h2>
              <input required placeholder="Street address, tole, ward" value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className={field} />
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={field} />
                <input placeholder="Municipality / City" value={form.municipality || form.city} onChange={(e) => setForm({ ...form, municipality: e.target.value, city: e.target.value })} className={field} />
              </div>
              <input placeholder="Nearby landmark (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={field} />
              <Button type="button" variant="outline" onClick={useCurrentLocation}><MapPin size={16} /> Use Current Location (for distance fee)</Button>

              <div className="rounded-xl border border-border bg-muted/40 p-4 flex gap-3">
                <Truck className="text-primary shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">Delivery from Morang HQ</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{deliveryInfo.label}</p>
                  {deliveryInfo.km != null && <p className="font-body text-xs text-primary mt-1">Distance: {deliveryInfo.km} km</p>}
                  <p className="font-body text-[11px] text-muted-foreground mt-2">
                    Tiers: 0–10km Rs.50 · 10–25km Rs.100 · 25–50km Rs.150 · 50–100km Rs.250 · farther higher. Free above Rs. {deliveryCfg.free_above}.
                  </p>
                </div>
              </div>

              <h2 className="font-display text-xl font-bold text-foreground pt-2">Payment method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const available = payments[method.id];
                  const selected = available && form.payment_method === method.id;
                  return (
                    <button key={method.id} type="button" disabled={!available} onClick={() => setForm({ ...form, payment_method: method.id })}
                      className={`min-h-[5.5rem] text-left border rounded-lg p-4 transition-all duration-200 ease-out ${
                        selected ? "border-primary bg-primary/10 scale-[1.03] shadow-md shadow-primary/10"
                          : available ? "border-border bg-card hover:border-primary/40 hover:scale-[1.03]"
                          : "border-border bg-muted/40 opacity-65 cursor-not-allowed"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {method.id === "cod" ? (
                          <span className="inline-flex items-center gap-1.5 h-10 px-2.5 rounded-lg bg-primary/10 text-primary font-bold text-sm"><Banknote size={18} /> COD</span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-12 w-[7.5rem] shrink-0 rounded-xl bg-transparent overflow-hidden">
                            <img src={method.logo} alt={`${method.name} logo`} className="h-10 w-auto max-w-full object-contain object-center" loading="lazy" decoding="async" />
                          </span>
                        )}
                        {available ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary"><Check size={13} /> Available</span>
                        ) : (
                          <span className="rounded-full bg-accent/15 text-accent px-2 py-1 text-[10px] uppercase font-bold">Coming Soon</span>
                        )}
                      </div>
                      <span className="flex items-center gap-2 mt-3 font-semibold text-sm text-foreground">{method.name}</span>
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
