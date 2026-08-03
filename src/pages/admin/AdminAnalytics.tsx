import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface Order { total: number; status: string; created_at: string; user_id: string | null }
interface Item { product_name: string; quantity: number; line_total: number }

const AdminAnalytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<{ created_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      const [o, i, p] = await Promise.all([
        supabase.from("orders").select("total,status,created_at,user_id"),
        supabase.from("order_items").select("product_name,quantity,line_total"),
        supabase.from("profiles").select("created_at"),
      ]);
      setOrders((o.data as unknown as Order[]) ?? []);
      setItems((i.data as unknown as Item[]) ?? []);
      setCustomers((p.data as unknown as { created_at: string }[]) ?? []);
    })();
  }, []);

  const days = Array.from({ length: 30 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - idx));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: orders.filter((o) => o.created_at.slice(0, 10) === key && o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0),
      orders: orders.filter((o) => o.created_at.slice(0, 10) === key).length,
      customers: customers.filter((c) => c.created_at.slice(0, 10) === key).length,
    };
  });

  const topProducts = Object.values(
    items.reduce<Record<string, { name: string; qty: number }>>((acc, i) => {
      acc[i.product_name] = acc[i.product_name] || { name: i.product_name, qty: 0 };
      acc[i.product_name].qty += i.quantity;
      return acc;
    }, {}),
  ).sort((a, b) => b.qty - a.qty).slice(0, 8);

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const card = "bg-card border border-border rounded-xl p-5";
  const tooltip = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}><p className="font-body text-xs uppercase text-muted-foreground mb-1">Total revenue</p><p className="font-display text-2xl font-bold text-foreground">{rs(revenue)}</p></div>
        <div className={card}><p className="font-body text-xs uppercase text-muted-foreground mb-1">Total orders</p><p className="font-display text-2xl font-bold text-foreground">{orders.length}</p></div>
        <div className={card}><p className="font-body text-xs uppercase text-muted-foreground mb-1">Total customers</p><p className="font-display text-2xl font-bold text-foreground">{customers.length}</p></div>
      </div>

      <div className={card}>
        <h2 className="font-display font-bold text-foreground mb-4">Revenue (30 days)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} interval={4} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={tooltip} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4">Orders & new customers</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} interval={6} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="customers" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={card}>
          <h2 className="font-display font-bold text-foreground mb-4">Top products by units sold</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} width={110} />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
