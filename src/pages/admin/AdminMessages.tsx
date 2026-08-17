import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, MessageSquare, Circle } from "lucide-react";
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
  thread_id?: string;
}

const AdminMessages = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [latestSender, setLatestSender] = useState<Record<string, string>>({});
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<string | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const loadThreads = async () => {
    const { data } = await supabase.from("chat_threads" as never).select("*").order("last_message_at", { ascending: false });
    const list = (data as unknown as Thread[]) ?? [];
    setThreads(list);

    const { data: msgs } = await supabase
      .from("chat_messages" as never)
      .select("thread_id,sender,created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    const map: Record<string, string> = {};
    for (const m of (msgs as { thread_id: string; sender: string }[] | null) ?? []) {
      if (!map[m.thread_id]) map[m.thread_id] = m.sender;
    }
    setLatestSender(map);
    setLoading(false);
  };

  const loadMessages = async (tid: string) => {
    const { data } = await supabase.from("chat_messages" as never).select("*").eq("thread_id", tid).order("created_at");
    setMessages((data as unknown as Msg[]) ?? []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    loadThreads();
    const channel = supabase
      .channel("admin-chat-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => {
        loadThreads();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const row = payload.new as Msg;
        loadThreads();
        if (row.sender !== "admin") {
          toast.message("New customer message", {
            description: (row.body || "").slice(0, 80),
          });
        }
        if (activeRef.current && row.thread_id === activeRef.current) {
          loadMessages(activeRef.current);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      await supabase
        .from("chat_threads" as never)
        .update({ last_message_at: new Date().toISOString(), status: "open" } as never)
        .eq("id", active);
      await loadMessages(active);
      await loadThreads();
    }
    setBusy(false);
  };

  const waitingCount = threads.filter((t) => (latestSender[t.id] || "guest") !== "admin").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f1111]">Buyer messages</h1>
          <p className="text-sm text-slate-600">Realtime inbox — reply opens on the customer chat widget</p>
        </div>
        {waitingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f90] text-[#111] text-xs font-bold px-3 py-1">
            <Circle size={8} className="fill-current" /> {waitingCount} awaiting reply
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#f90]" size={28} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-3 min-h-[32rem]">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Conversations ({threads.length})
            </div>
            {threads.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                <MessageSquare size={28} className="text-slate-300" />
                No messages yet
              </div>
            ) : (
              <ul className="overflow-y-auto flex-1 max-h-[70vh]">
                {threads.map((t) => {
                  const needsReply = (latestSender[t.id] || "guest") !== "admin";
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setActive(t.id)}
                        className={`w-full text-left px-3 py-3 border-b border-slate-100 text-sm transition-colors ${
                          active === t.id ? "bg-[#eef6f6] border-l-4 border-l-[#f90]" : "hover:bg-slate-50 border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {needsReply && <span className="w-2 h-2 rounded-full bg-[#f90] shrink-0" />}
                          <p className={`truncate flex-1 ${needsReply ? "font-bold text-[#0f1111]" : "font-medium text-slate-800"}`}>
                            {t.guest_name || "Guest"}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{new Date(t.last_message_at).toLocaleString()}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-[28rem]">
            {!active ? (
              <p className="m-auto text-sm text-slate-500">Select a conversation to reply</p>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="font-semibold text-[#0f1111]">{threads.find((t) => t.id === active)?.guest_name || "Guest"}</p>
                  <p className="text-xs text-slate-500">{threads.find((t) => t.id === active)?.guest_email || "No email"}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f6f7f8]">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          m.sender === "admin" ? "bg-[#232f3e] text-white" : "bg-white text-[#0f1111] border border-slate-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className={`text-[10px] mt-1 ${m.sender === "admin" ? "text-white/60" : "text-slate-400"}`}>
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={send} className="border-t border-slate-200 p-3 flex gap-2 bg-white">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply to the customer…"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f90]/40"
                  />
                  <Button type="submit" disabled={busy || !reply.trim()} className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200]">
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
