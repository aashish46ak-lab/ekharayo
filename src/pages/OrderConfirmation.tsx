import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { generateInvoicePdf, type InvoiceCompany, type InvoiceOrder, type InvoiceItem } from "@/lib/invoice";
import { toast } from "sonner";
import { CheckCircle2, Download, Loader2, Package } from "lucide-react";

interface OrderRow extends InvoiceOrder {
  notes?: string | null;
  coupon_code?: string | null;
}
interface ItemRow extends InvoiceItem {
  id: string;
  image_url?: string | null;
}

const paymentLabel = (m: string) =>
  ({ cod: "Cash on Delivery", esewa: "eSewa", khalti: "Khalti", fonepay: "Fonepay", imepay: "IME Pay" } as Record<string, string>)[m] ?? m;

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [company, setCompany] = useState<InvoiceCompany>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const [o, it, settings] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id!).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", id!),
        supabase.from("site_settings").select("key,value").in("key", ["branding", "contact", "company"]),
      ]);
      setOrder((o.data as unknown as OrderRow) ?? null);
      setItems((it.data as unknown as ItemRow[]) ?? []);

      const map: Record<string, any> = {};
      (settings.data ?? []).forEach((row) => { map[row.key] = row.value; });
      setCompany({
        name: map.company?.name,
        logo_url: map.branding?.logo_url,
        phone1: map.contact?.phone1,
        phone2: map.contact?.phone2,
        email: map.contact?.email,
        address: map.contact?.address,
      });

      setLoading(false);
    })();
  }, [id]);

  const handleDownload = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      await generateInvoicePdf(order, items, company);
    } catch {
      toast.error("Could not generate invoice");
    } finally {
      setDownloading(false);
    }
  };

  const addressParts = order
    ? [
        order.address_line,
        order.ward ? `Ward ${order.ward}` : "",
        order.municipality,
        order.district,
        order.province,
        order.city,
        order.postal_code,
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Order Confirmed" subtitle="Thank you for shopping with eKharayo">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
          ) : !order ? (
            <p className="font-body text-center text-muted-foreground">Order not found.</p>
          ) : (
            <div className="space-y-6">
              {/* Hero */}
              <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-fade-in-up">
                  <CheckCircle2 className="text-primary" size={48} />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Order confirmed</h2>
                <p className="font-display text-lg font-semibold text-primary mb-2">#{order.order_number}</p>
                <p className="font-body text-sm text-muted-foreground">
                  We'll contact you at <span className="text-foreground font-medium">{order.customer_phone}</span> to confirm delivery.
                </p>
              </div>

              {/* Order details */}
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h3 className="font-display text-lg font-bold text-foreground">Order details</h3>
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase">
                    {order.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-6 font-body text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Delivery address</p>
                    <p className="text-foreground">{addressParts.join(", ") || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Payment method: </span><span className="text-foreground font-medium">{paymentLabel(order.payment_method)}</span></p>
                    <p><span className="text-muted-foreground">Delivery method: </span><span className="text-foreground font-medium">{order.delivery_method ?? "standard"}</span></p>
                    <p><span className="text-muted-foreground">Order date: </span><span className="text-foreground font-medium">{new Date(order.created_at).toLocaleString()}</span></p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Package size={15} /> Items</h4>
                  <div className="space-y-2 font-body text-sm">
                    {items.map((i) => (
                      <div key={i.id} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{i.product_name} <span className="text-xs">({rs(Number(i.unit_price))} × {i.quantity})</span></span>
                        <span className="text-foreground font-medium">{rs(Number(i.line_total))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border mt-5 pt-4 space-y-2 font-body text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{rs(Number(order.subtotal))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span className="text-foreground">{rs(Number(order.delivery_fee || 0))}</span></div>
                  {Number(order.shipping_charge || 0) > 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-foreground">{rs(Number(order.shipping_charge || 0))}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="text-foreground">{rs(Number(order.tax || 0))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-foreground">− {rs(Number(order.discount || 0))}</span></div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-semibold text-foreground">Grand Total</span>
                    <span className="font-display text-lg font-bold text-primary">{rs(Number(order.total))}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60"
                >
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download Invoice (PDF)
                </button>
                <Link to="/my-orders" className="border border-border text-foreground font-body font-semibold px-5 py-3 rounded-lg hover:border-primary/40 transition-colors">My orders</Link>
                <Link to="/products" className="border border-border text-foreground font-body font-semibold px-5 py-3 rounded-lg hover:border-primary/40 transition-colors">Continue shopping</Link>
              </div>
            </div>
          )}
        </div>
      </PageShell>
      <SiteFooter />
    </div>
  );
};

export default OrderConfirmation;
