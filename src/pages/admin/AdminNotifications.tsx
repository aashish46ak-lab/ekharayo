import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCheck } from "lucide-react";

interface Note { id: string; type: string; title: string; message: string | null; is_read: boolean; created_at: string }

const AdminNotifications = () => {
  const [rows, setRows] = useState<Note[]>([]);

  const load = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setRows((data as unknown as Note[]) ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase.channel("notif-live").on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAll = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
        <button onClick={markAll} className="inline-flex items-center gap-2 border border-border text-foreground font-body text-sm px-4 py-2.5 rounded-lg hover:border-primary/40"><CheckCheck size={15} /> Mark all read</button>
      </div>
      <div className="space-y-2">
        {rows.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 bg-card border rounded-xl p-4 ${n.is_read ? "border-border" : "border-primary/40"}`}>
            <Bell size={16} className="text-primary mt-0.5" />
            <div>
              <p className="font-body text-sm font-semibold text-foreground">{n.title}</p>
              <p className="font-body text-sm text-muted-foreground">{n.message}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="font-body text-center text-muted-foreground py-10">No notifications yet.</p>}
      </div>
    </div>
  );
};

export default AdminNotifications;
