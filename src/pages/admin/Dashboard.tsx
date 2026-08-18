import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  DollarSign,
  Package,
  Users,
  Plus,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Truck,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}
interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
}

const statusClass: Record<string, string> = {
  pending: "bg-accent/15 text-accent",
  confirmed: "bg-primary/15 text-primary",
  processing: "bg-secondary text-foreground",
  packed: "bg-secondary text-foreground",
  shipped: "bg-primary/10 text-primary",
  out_for_delivery: "bg-primary/15 text-primary",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState(0);
  const [openThreads, setOpenThreads] = useState(0);

  const load = async () => {
    const [o, p, cu, t] = await Promise.all([
      supabase.from("orders").select("id,order_number,customer_name,total,status,created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("products").select("id,name,stock,price"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("chat_threads" as never).select("*", { count: "exact", head: true }).neq("status", "closed"),
    ]);
    setOrders((o.data as unknown as Order[]) ?? []);
    setProducts((p.data as unknown as Product[]) ?? []);
    setCustomers(cu.count ?? 0);
    setOpenThreads(t.count ?? 0);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pending = orders.filter((o) => ["pending", "confirmed", "processing"].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const lowStock = products.filter((p) => p.stock <= 5);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === key);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      orders: dayOrders.length,
    };
  });

  const kpis = [
    { label: "Orders to fulfill", value: pending, icon: Clock, href: "/admin/orders" },
    { label: "Open messages", value: openThreads, icon: MessageSquare, href: "/admin/messages" },
    { label: "Revenue", value: rs(revenue), icon: DollarSign, href: "/admin/analytics" },
    { label: "Customers", value: customers, icon: Users, href: "/admin/customers" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Orders, catalog, and customer chats</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/products" className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-3 py-2 shadow-sm hover:opacity-95">
            <Plus size={15} /> Add product
          </Link>
          <Link to="/admin/orders" className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border text-foreground text-sm font-semibold px-3 py-2 shadow-sm hover:bg-secondary">
            <Truck size={15} /> Manage orders
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.href} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</span>
              <k.icon size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{k.value}</p>
          </Link>
        ))}
      </div>

      {(pending > 0 || openThreads > 0 || lowStock.length > 0) && (
        <div className="bg-accent/10 border border-accent/25 rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-accent" /> Needs attention
          </h2>
          <ul className="space-y-1.5 text-sm text-foreground/85">
            {pending > 0 && (
              <li>
                <Link to="/admin/orders" className="text-primary font-medium hover:underline">
                  {pending} order(s) awaiting fulfillment
                </Link>
              </li>
            )}
            {openThreads > 0 && (
              <li>
                <Link to="/admin/messages" className="text-primary font-medium hover:underline">
                  {openThreads} open customer conversation(s)
                </Link>
              </li>
            )}
            {lowStock.length > 0 && (
              <li>
                <Link to="/admin/products" className="text-primary font-medium hover:underline">
                  {lowStock.length} product(s) low on stock
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Orders (7 days)</h2>
            <Link to="/admin/analytics" className="text-xs text-primary hover:underline inline-flex items-center gap-0.5">
              Analytics <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-foreground mb-3">Snapshot</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground flex items-center gap-2"><ShoppingBag size={14} /> Total orders</span>
              <span className="font-semibold text-foreground">{orders.length}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 size={14} /> Delivered</span>
              <span className="font-semibold text-foreground">{delivered}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground flex items-center gap-2"><Package size={14} /> Active SKUs</span>
              <span className="font-semibold text-foreground">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-2"><AlertTriangle size={14} /> Low stock</span>
              <span className="font-semibold text-accent">{lowStock.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Order</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-2.5 font-medium text-primary">{o.order_number || o.id.slice(0, 8)}</td>
                  <td className="px-4 py-2.5 text-foreground">{o.customer_name}</td>
                  <td className="px-4 py-2.5 text-foreground">{rs(Number(o.total))}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusClass[o.status] || "bg-muted text-muted-foreground"}`}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
