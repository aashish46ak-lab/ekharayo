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
  payment_method?: string;
}
interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
}

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  processing: "bg-blue-100 text-blue-800",
  packed: "bg-indigo-100 text-indigo-800",
  shipped: "bg-violet-100 text-violet-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-slate-100 text-slate-700",
};

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState(0);
  const [openThreads, setOpenThreads] = useState(0);

  const load = async () => {
    const [o, p, cu, t] = await Promise.all([
      supabase.from("orders").select("id,order_number,customer_name,total,status,created_at,payment_method").order("created_at", { ascending: false }).limit(50),
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
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
    };
  });

  const kpis = [
    { label: "Orders to fulfill", value: pending, icon: Clock, tone: "border-l-[#f90]", href: "/admin/orders" },
    { label: "Open messages", value: openThreads, icon: MessageSquare, tone: "border-l-sky-500", href: "/admin/messages" },
    { label: "Revenue (listed)", value: rs(revenue), icon: DollarSign, tone: "border-l-emerald-500", href: "/admin/analytics" },
    { label: "Customers", value: customers, icon: Users, tone: "border-l-violet-500", href: "/admin/customers" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f1111]">Dashboard</h1>
          <p className="text-sm text-slate-600">Manage orders, catalog, and customer chats</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/products" className="inline-flex items-center gap-1.5 rounded-md bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-sm font-semibold px-3 py-2 border border-[#fcd200] shadow-sm">
            <Plus size={15} /> Add product
          </Link>
          <Link to="/admin/orders" className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-slate-50 text-[#0f1111] text-sm font-semibold px-3 py-2 border border-slate-300 shadow-sm">
            <Truck size={15} /> Manage orders
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.href} className={`bg-white rounded-lg border border-slate-200 border-l-4 ${k.tone} p-4 shadow-sm hover:shadow transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{k.label}</span>
              <k.icon size={16} className="text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-[#0f1111]">{k.value}</p>
          </Link>
        ))}
      </div>

      {(pending > 0 || openThreads > 0 || lowStock.length > 0) && (
        <div className="bg-[#fff8e7] border border-[#fcd200] rounded-lg p-4">
          <h2 className="font-semibold text-[#0f1111] mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#f90]" /> Needs attention
          </h2>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {pending > 0 && (
              <li>
                <Link to="/admin/orders" className="text-[#007185] hover:underline font-medium">
                  {pending} order(s) awaiting fulfillment
                </Link>
              </li>
            )}
            {openThreads > 0 && (
              <li>
                <Link to="/admin/messages" className="text-[#007185] hover:underline font-medium">
                  {openThreads} open customer conversation(s)
                </Link>
              </li>
            )}
            {lowStock.length > 0 && (
              <li>
                <Link to="/admin/products" className="text-[#007185] hover:underline font-medium">
                  {lowStock.length} product(s) low on stock
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#0f1111]">Orders (7 days)</h2>
            <Link to="/admin/analytics" className="text-xs text-[#007185] hover:underline inline-flex items-center gap-0.5">
              Analytics <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="orders" fill="#f90" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h2 className="font-semibold text-[#0f1111] mb-3">Snapshot</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600 flex items-center gap-2"><ShoppingBag size={14} /> Total orders</span>
              <span className="font-semibold">{orders.length}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600 flex items-center gap-2"><CheckCircle2 size={14} /> Delivered</span>
              <span className="font-semibold">{delivered}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600 flex items-center gap-2"><Package size={14} /> Active SKUs</span>
              <span className="font-semibold">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 flex items-center gap-2"><AlertTriangle size={14} /> Low stock</span>
              <span className="font-semibold text-amber-700">{lowStock.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-[#0f1111]">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs text-[#007185] hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
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
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-2.5 font-medium text-[#007185]">{o.order_number || o.id.slice(0, 8)}</td>
                  <td className="px-4 py-2.5">{o.customer_name}</td>
                  <td className="px-4 py-2.5">{rs(Number(o.total))}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColor[o.status] || "bg-slate-100 text-slate-700"}`}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No orders yet
                  </td>
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
