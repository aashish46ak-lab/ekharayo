import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Thread {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
}
interface Msg {
  id: string;
  sender: string;
  body: string;
  created_at: string;
}

const AdminMessages = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadThreads = async () => {
    const { data } = await supabase
      .from("chat_threads" as never)
      .select("*")
      .order("last_message_at", { ascending: false });
    setThreads((data as unknown as Thread[]) ?? []);
    setLoading(false);
  };

  const loadMessages = async (tid: string) => {
    const { data } = await supabase
      .from("chat_messages" as never)
      .select("*")
      .eq("thread_id", tid)
      .order("created_at");
    setMessages((data as unknown as Msg[]) ?? []);
  };

  useEffect(() => {
    loadThreads();
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, loadThreads)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        if (active) loadMessages(active);
        loadThreads();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [active]);

  useEffect(() => {
    if (active) loadMessages(active);
  }, [active]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("chat_messages" as never).insert({
      thread_id: active,
      sender: "admin",
      body: reply.trim(),
    } as never);
    if (error) toast.error(error.message);
    else {
      setReply("");
      await supabase.from("chat_threads" as never).update({ last_message_at: new Date().toISOString() } as never).eq("id", active);
      loadMessages(active);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Messages</h1>
      <p className="font-body text-sm text-muted-foreground">Customer chat from the website "Chat with us" widget</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={26} /></div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 min-h-[28rem]">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-border font-body text-xs uppercase tracking-wide text-muted-foreground">Conversations</div>
            {threads.length === 0 ? (
              <p className="p-4 font-body text-sm text-muted-foreground flex items-center gap-2"><MessageSquare size={16} /> No messages yet</p>
            ) : (
              <ul className="max-h-[32rem] overflow-y-auto">
                {threads.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setActive(t.id)}
                      className={`w-full text-left px-3 py-3 border-b border-border font-body text-sm transition-colors ${
                        active === t.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <p className="font-semibold truncate">{t.guest_name || "Guest"}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(t.last_message_at).toLocaleString()}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl flex flex-col min-h-[28rem]">
            {!active ? (
              <p className="m-auto font-body text-sm text-muted-foreground">Select a conversation</p>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 font-body text-sm ${
                        m.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}>
                        <p>{m.body}</p>
                        <p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply to customer…"
                    className="flex-1 border border-border rounded-lg px-3 py-2 font-body text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="submit" disabled={busy || !reply.trim()}>
                    {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Send
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
