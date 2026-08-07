import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { ShoppingBag, Clock, CheckCircle2, XCircle, DollarSign, Package, Tags, Users, Plus, AlertTriangle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Order { id: string; order_number: string; customer_name: string; total: number; status: string; created_at: string }
interface Product { id: string; name: string; stock: number; price: number }
interface Item { product_name: string; quantity: number; line_total: number }

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [activity, setActivity] = useState<{ id: string; title: string; created_at: string }[]>([]);

  const load = async () => {
    const [o, p, c, cu, it, n] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id,name,stock,price"),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("order_items").select("product_name,quantity,line_total"),
      supabase.from("notifications").select("id,title,created_at").order("created_at", { ascending: false }).limit(6),
    ]);
    setOrders((o.data as unknown as Order[]) ?? []);
    setProducts((p.data as unknown as Product[]) ?? []);
    setCategories(c.count ?? 0);
    setCustomers(cu.count ?? 0);
    setItems((it.data as unknown as Item[]) ?? []);
    setActivity((n.data as unknown as { id: string; title: string; created_at: string }[]) ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const byStatus = (s: string) => orders.filter((o) => o.status === s).length;
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const lowStock = products.filter((p) => p.stock <= 5);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    { label: "Pending", value: byStatus("pending"), icon: Clock },
    { label: "Delivered", value: byStatus("delivered"), icon: CheckCircle2 },
    { label: "Cancelled", value: byStatus("cancelled"), icon: XCircle },
    { label: "Total Revenue", value: rs(revenue), icon: DollarSign },
    { label: "Products", value: products.length, icon: Package },
    { label: "Categories", value: categories, icon: Tags },
    { label: "Customers", value: customers, icon: Users },
  ];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === key);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
    };
  });

  const topSelling = Object.values(
    items.reduce<Record<string, { name: string; qty: number; total: number }>>((acc, i) => {
      acc[i.product_name] = acc[i.product_name] || { name: i.product_name, qty: 0, total: 0 };
      acc[i.product_name].qty += i.quantity;
      acc[i.product_name].total += Number(i.line_total);
      return acc;
    }, {}),
  ).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const card = "bg-card border border-border rounded-xl p-5";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors"><Plus size={16} /> Add product</Link>
          <Link to="/admin/categories" className="inline-flex items-center gap-2 border border-border text-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-primary/40 transition-colors"><Plus size={16} /> Add category</Link>
          <Link to="/admin/orders" className="inline-flex items-center gap-2 border border-border text-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-primary/40 transition-colors">Manage orders</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={card}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs uppercase tracking-wide text-muted-foreground">{s.label}</span>
              <s.icon size={16} className="text-primary" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4">Sales analytics (7 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4">Revenue analytics (7 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4">Recent orders</h2>
          {orders.slice(0, 6).map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 font-body text-sm">
              <div><p className="text-foreground">{o.order_number}</p><p className="text-xs text-muted-foreground">{o.customer_name}</p></div>
              <div className="text-right"><p className="text-primary font-semibold">{rs(Number(o.total))}</p><p className="text-xs text-muted-foreground">{o.status}</p></div>
            </div>
          ))}
          {orders.length === 0 && <p className="font-body text-sm text-muted-foreground">No orders yet.</p>}
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4">Top selling products</h2>
          {topSelling.map((t) => (
            <div key={t.name} className="flex items-center justify-between py-2 border-b border-border last:border-0 font-body text-sm">
              <span className="text-foreground">{t.name}</span>
              <span className="text-muted-foreground">{t.qty} sold · {rs(t.total)}</span>
            </div>
          ))}
          {topSelling.length === 0 && <p className="font-body text-sm text-muted-foreground">No sales data yet.</p>}
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-accent" /> Low stock products</h2>
          {lowStock.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 font-body text-sm">
              <span className="text-foreground">{p.name}</span>
              <span className="text-accent">{p.stock} left</span>
            </div>
          ))}
          {lowStock.length === 0 && <p className="font-body text-sm text-muted-foreground">All products are well stocked.</p>}
        </div>

        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4">Recent activity</h2>
          {activity.map((a) => (
            <div key={a.id} className="py-2 border-b border-border last:border-0 font-body text-sm">
              <p className="text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          ))}
          {activity.length === 0 && <p className="font-body text-sm text-muted-foreground">Nothing yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
