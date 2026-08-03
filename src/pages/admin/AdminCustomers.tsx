import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";
import { Search } from "lucide-react";

interface Profile { id: string; email: string | null; full_name: string | null; phone: string | null; created_at: string }
interface Order { id: string; user_id: string | null; order_number: string; total: number; status: string; created_at: string }

const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [p, o] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("id,user_id,order_number,total,status,created_at"),
      ]);
      setProfiles((p.data as unknown as Profile[]) ?? []);
      setOrders((o.data as unknown as Order[]) ?? []);
    })();
  }, []);

  const visible = profiles.filter((p) => `${p.email} ${p.full_name}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Customers</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" className="border border-border rounded-lg pl-9 pr-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-56" />
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((p) => {
          const mine = orders.filter((o) => o.user_id === p.id);
          const spent = mine.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
          return (
            <div key={p.id} className="bg-card border border-border rounded-xl">
              <button onClick={() => setOpen(open === p.id ? null : p.id)} className="w-full flex flex-wrap items-center justify-between gap-3 p-5 text-left">
                <div>
                  <p className="font-display font-bold text-foreground">{p.full_name || p.email}</p>
                  <p className="font-body text-xs text-muted-foreground">{p.email} · joined {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <p className="font-body text-sm text-muted-foreground">{mine.length} orders · <span className="text-primary font-semibold">{rs(spent)}</span></p>
              </button>
              {open === p.id && (
                <div className="border-t border-border p-5 space-y-2 font-body text-sm">
                  {mine.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
                  {mine.map((o) => (
                    <div key={o.id} className="flex justify-between text-muted-foreground">
                      <span>{o.order_number} · {o.status}</span>
                      <span>{rs(Number(o.total))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {visible.length === 0 && <p className="font-body text-center text-muted-foreground py-10">No customers found.</p>}
      </div>
    </div>
  );
};

export default AdminCustomers;
