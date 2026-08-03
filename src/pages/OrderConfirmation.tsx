import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { CheckCircle2, Loader2 } from "lucide-react";

interface OrderRow {
  id: string; order_number: string; customer_name: string; customer_phone: string; address_line: string;
  city: string; total: number; status: string; payment_method: string; created_at: string;
}
interface ItemRow { id: string; product_name: string; quantity: number; line_total: number }

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, it] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id!).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", id!),
      ]);
      setOrder((o.data as unknown as OrderRow) ?? null);
      setItems((it.data as unknown as ItemRow[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Order Confirmed" subtitle="Thank you for shopping with eKharayo">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
          ) : !order ? (
            <p className="font-body text-center text-muted-foreground">Order not found.</p>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Order {order.order_number}</h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                We received your order and will contact you at {order.customer_phone} to confirm delivery.
              </p>
              <div className="text-left border-t border-border pt-5 space-y-2 font-body text-sm">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span className="text-muted-foreground">{i.product_name} × {i.quantity}</span>
                    <span className="text-foreground">{rs(Number(i.line_total))}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-display font-bold text-primary">{rs(Number(order.total))}</span>
                </div>
                <p className="text-muted-foreground pt-3">Deliver to: {order.address_line}, {order.city}</p>
                <p className="text-muted-foreground">Payment: {order.payment_method === "cod" ? "Cash on delivery" : "Bank transfer"}</p>
              </div>
              <div className="flex gap-3 justify-center mt-7">
                <Link to="/my-orders" className="bg-primary text-primary-foreground font-body font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors">My orders</Link>
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
