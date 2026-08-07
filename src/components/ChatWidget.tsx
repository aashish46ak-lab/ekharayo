import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Msg {
  id: string;
  sender: "customer" | "admin";
  body: string;
  created_at: string;
}

const STORAGE_KEY = "ekharayo-chat-thread";

/** Single floating message icon (bottom-right) — talks to admin Messages */
const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (tid: string) => {
    const { data } = await supabase
      .from("chat_messages" as never)
      .select("id,sender,body,created_at")
      .eq("thread_id", tid)
      .order("created_at");
    setMessages((data as unknown as Msg[]) ?? []);
  };

  useEffect(() => {
    if (!threadId || !open) return;
    loadMessages(threadId);
    const channel = supabase
      .channel(`chat-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${threadId}` }, () => loadMessages(threadId))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [threadId, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const ensureThread = async () => {
    if (threadId) return threadId;
    const { data, error } = await supabase
      .from("chat_threads" as never)
      .insert({
        user_id: user?.id ?? null,
        guest_name: name.trim() || user?.email || "Guest",
        guest_email: user?.email ?? null,
        status: "open",
      } as never)
      .select("id")
      .single();
    if (error || !data) {
      toast.error(error?.message || "Could not start chat");
      return null;
    }
    const id = (data as { id: string }).id;
    localStorage.setItem(STORAGE_KEY, id);
    setThreadId(id);
    return id;
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    const tid = await ensureThread();
    if (!tid) {
      setBusy(false);
      return;
    }
    const { error } = await supabase.from("chat_messages" as never).insert({
      thread_id: tid,
      sender: "customer",
      body,
    } as never);
    if (error) toast.error(error.message);
    else {
      setText("");
      await supabase.from("chat_threads" as never).update({ last_message_at: new Date().toISOString() } as never).eq("id", tid);
      loadMessages(tid);
    }
    setBusy(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/30 hover:scale-105 transition-transform"
          aria-label="Message admin"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-[60] w-[min(100vw-2rem,22rem)] h-[28rem] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div>
              <p className="font-display font-bold text-sm">Message</p>
              <p className="font-body text-[10px] opacity-80">Admin will reply here</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 rounded hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/50">
            {messages.length === 0 && (
              <p className="font-body text-xs text-muted-foreground text-center py-6">Type a message for the admin team.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 font-body text-xs ${
                  m.sender === "customer" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="border-t border-border p-2 space-y-2 bg-card">
            {!user && !threadId && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-border rounded-lg px-3 py-1.5 font-body text-xs bg-muted focus:outline-none"
              />
            )}
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 border border-border rounded-lg px-3 py-2 font-body text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" disabled={busy || !text.trim()} className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
