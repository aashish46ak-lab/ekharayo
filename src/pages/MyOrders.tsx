import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { rs } from "@/lib/media";
import { Loader2 } from "lucide-react";

interface OrderRow { id: string; order_number: string; total: number; status: string; created_at: string }

const statusStyle: Record<string, string> = {
  pending: "bg-accent/15 text-accent",
  confirmed: "bg-primary/15 text-primary",
  processing: "bg-primary/15 text-primary",
  packed: "bg-primary/15 text-primary",
  shipped: "bg-primary/20 text-primary",
  out_for_delivery: "bg-primary/20 text-primary",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/15 text-destructive",
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = () => supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setOrders((data as unknown as OrderRow[]) ?? []);
      setLoading(false);
    });
    load();
    const channel = supabase.channel(`my-orders-${user.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="My Orders" subtitle="Track everything you've ordered from eKharayo">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
          ) : orders.length === 0 ? (
            <p className="font-body text-center text-muted-foreground">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Link key={o.id} to={`/order-confirmation/${o.id}`} className="flex items-center justify-between bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
                  <div>
                    <p className="font-display font-bold text-foreground">{o.order_number}</p>
                    <p className="font-body text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-body text-[11px] uppercase px-2.5 py-1 rounded-full ${statusStyle[o.status] ?? ""}`}>{o.status.replaceAll("_", " ")}</span>
                    <span className="font-body font-semibold text-primary">{rs(Number(o.total))}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageShell>
      <SiteFooter />
    </div>
  );
};

export default MyOrders;
