import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { toast } from "sonner";
import { queueOrderNotification, type OrderEvent } from "@/lib/notifications";
import { Search, Loader2 } from "lucide-react";

interface Order {
  id: string; order_number: string; customer_name: string; customer_email: string; customer_phone: string;
  address_line: string; city: string; district: string | null; notes: string | null; payment_method: string;
  payment_status: string; subtotal: number; delivery_fee: number; total: number; status: string; created_at: string;
}
interface Item { id: string; order_id: string; product_name: string; quantity: number; unit_price: number; line_total: number }

const statuses = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [o, i] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("order_items").select("*"),
    ]);
    setOrders((o.data as unknown as Order[]) ?? []);
    setItems((i.data as unknown as Item[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const update = async (id: string, status: string) => {
    const nextStatus = status as (typeof statuses)[number];
    const order = orders.find((o) => o.id === id);
    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    const eventMap: Record<string, OrderEvent> = {
      confirmed: "order_confirmed",
      processing: "order_processing",
      packed: "order_packed",
      shipped: "order_shipped",
      out_for_delivery: "out_for_delivery",
      delivered: "order_delivered",
      cancelled: "order_cancelled",
    };
    const ev = eventMap[nextStatus];
    if (ev && order) {
      await queueOrderNotification({
        orderId: id,
        email: order.customer_email,
        orderNumber: order.order_number,
        event: ev,
        total: Number(order.total),
      });
    }
    toast.success(ev ? "Order updated · customer notified" : "Order updated");
    load();
  };

  const updatePayment = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Payment status updated");
    load();
  };

  const visible = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      [o.order_number, o.customer_name, o.customer_email, o.customer_phone].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const field = "border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Orders</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders" className={`${field} pl-9 w-52`} />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={field}>
            <option value="all">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={26} /></div>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl">
              <button onClick={() => setOpen(open === o.id ? null : o.id)} className="w-full flex flex-wrap items-center justify-between gap-3 p-5 text-left">
                <div>
                  <p className="font-display font-bold text-foreground">{o.order_number}</p>
                  <p className="font-body text-xs text-muted-foreground">{o.customer_name} · {new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body font-semibold text-primary">{rs(Number(o.total))}</span>
                  <select value={o.status} onClick={(e) => e.stopPropagation()} onChange={(e) => update(o.id, e.target.value)} className={field}>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </button>
              {open === o.id && (
                <div className="border-t border-border p-5 grid gap-4 md:grid-cols-2 font-body text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Customer</p>
                    <p className="text-muted-foreground">{o.customer_name}</p>
                    <p className="text-muted-foreground">{o.customer_email}</p>
                    <p className="text-muted-foreground">{o.customer_phone}</p>
                    <p className="text-muted-foreground mt-2">{o.address_line}, {o.city} {o.district}</p>
                    {o.notes && <p className="text-muted-foreground mt-2 whitespace-pre-line">{o.notes}</p>}
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      Payment: {o.payment_method} ·{" "}
                      <select value={o.payment_status} onChange={(e) => updatePayment(o.id, e.target.value)} className="bg-transparent border-none p-0 text-foreground font-semibold focus:ring-0 cursor-pointer">
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                        <option value="refunded">refunded</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Items</p>
                    {items.filter((i) => i.order_id === o.id).map((i) => (
                      <div key={i.id} className="flex justify-between text-muted-foreground">
                        <span>{i.product_name} × {i.quantity}</span>
                        <span>{rs(Number(i.line_total))}</span>
                      </div>
                    ))}
                    <div className="flex justify-between mt-2 pt-2 border-t border-border text-foreground">
                      <span>Total</span><span className="font-semibold text-primary">{rs(Number(o.total))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {visible.length === 0 && <p className="font-body text-center text-muted-foreground py-10">No orders found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
