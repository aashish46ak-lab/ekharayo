import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { Heart, Loader2, Star, ChevronDown, ChevronUp, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  display_name: string;
  rating: number;
  body: string;
  likes_count: number;
  created_at: string;
}

const LIKER_KEY = "ekharayo-liker";

function getLikerKey(userId?: string | null) {
  if (userId) return `u:${userId}`;
  try {
    let k = localStorage.getItem(LIKER_KEY);
    if (!k) {
      k = `g:${crypto.randomUUID()}`;
      localStorage.setItem(LIKER_KEY, k);
    }
    return k;
  } catch {
    return `g:anon`;
  }
}

const StarRow = ({
  value,
  onChange,
  size = 18,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) => (
  <div className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange?.(n)}
        className={!onChange ? "cursor-default" : "hover:scale-110 transition-transform"}
        aria-label={`${n} stars`}
      >
        <Star
          size={size}
          className={n <= value ? "text-accent fill-accent" : "text-muted-foreground/40"}
        />
      </button>
    ))}
  </div>
);

const PublicComments = () => {
  const { t } = useLang();
  const { user } = useAuth();
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const load = async () => {
    const { data, error } = await supabase
      .from("site_reviews" as never)
      .select("id,display_name,rating,body,likes_count,created_at")
      .eq("is_approved", true)
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      // table may not exist yet
      setRows([]);
    } else {
      setRows((data as unknown as Review[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const topIds = useMemo(() => new Set(rows.slice(0, 3).map((r) => r.id)), [rows]);

  const visible = useMemo(() => {
    if (showAll) return rows;
    // Highlight top 2–3 by likes; hide the rest until View more
    return rows.slice(0, Math.min(3, rows.length));
  }, [rows, showAll]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || body.trim().length < 3) return toast.error("Write at least a short comment");
    if (!name.trim()) return toast.error("Please enter your name");
    setBusy(true);
    const { error } = await supabase.from("site_reviews" as never).insert({
      user_id: user?.id ?? null,
      display_name: name.trim().slice(0, 60),
      rating,
      body: body.trim().slice(0, 1000),
      is_approved: true,
    } as never);
    setBusy(false);
    if (error) return toast.error(error.message || "Could not post — run site_reviews migration");
    toast.success("Thank you for your feedback!");
    setBody("");
    setRating(5);
    load();
  };

  const like = async (id: string) => {
    if (liked.has(id)) return;
    const key = getLikerKey(user?.id);
    const { data, error } = await supabase.rpc("like_site_review" as never, {
      p_review_id: id,
      p_liker_key: key,
    } as never);
    if (error) {
      // fallback: optimistic only if RPC missing
      toast.error(error.message || "Like failed");
      return;
    }
    setLiked((s) => new Set(s).add(id));
    const count = typeof data === "number" ? data : null;
    setRows((list) =>
      list
        .map((r) => (r.id === id ? { ...r, likes_count: count ?? r.likes_count + 1 } : r))
        .sort((a, b) => b.likes_count - a.likes_count || +new Date(b.created_at) - +new Date(a.created_at)),
    );
  };

  return (
    <section className="container mx-auto px-4 py-14 sm:py-16">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{t("commentsTitle")}</h2>
        <p className="font-body text-sm text-muted-foreground mt-2">{t("commentsSub")}</p>
      </div>

      {/* Submit form */}
      <form
        onSubmit={submit}
        className="max-w-2xl mx-auto mb-10 rounded-2xl border border-border bg-card/70 p-5 sm:p-6 space-y-3"
      >
        <div className="flex items-center gap-2 font-body text-sm font-semibold text-foreground">
          <MessageSquarePlus size={18} className="text-primary" /> Leave a review
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StarRow value={rating} onChange={setRating} size={22} />
          <span className="font-body text-xs text-muted-foreground">{rating}/5</span>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={60}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience…"
          rows={3}
          className="w-full border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          maxLength={1000}
        />
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? <Loader2 className="animate-spin" size={16} /> : null} Post comment
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={26} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center font-body text-sm text-muted-foreground py-8">
          Be the first to leave a star rating and comment.
        </p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {visible.map((r) => {
              const highlight = topIds.has(r.id) && r.likes_count > 0;
              return (
                <article
                  key={r.id}
                  className={`rounded-2xl border p-5 text-left transition-shadow ${
                    highlight
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                      : "border-border bg-card"
                  }`}
                >
                  {highlight && (
                    <span className="inline-block mb-2 rounded-full bg-primary/15 text-primary px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide">
                      Top liked
                    </span>
                  )}
                  <StarRow value={r.rating} />
                  <p className="font-body text-sm text-foreground/90 leading-relaxed mt-3 mb-4">{r.body}</p>
                  <div className="flex items-center justify-between gap-2">
                    <footer className="font-body text-xs font-semibold text-primary">{r.display_name}</footer>
                    <button
                      type="button"
                      onClick={() => like(r.id)}
                      disabled={liked.has(r.id)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-body text-xs transition-colors ${
                        liked.has(r.id)
                          ? "border-primary/40 text-primary bg-primary/10"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                      }`}
                      aria-label="Like comment"
                    >
                      <Heart size={13} className={liked.has(r.id) ? "fill-primary text-primary" : ""} />
                      {r.likes_count}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {rows.length > 3 && (
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:underline"
              >
                {showAll ? (
                  <>
                    Show less <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    View more ({rows.length - 3} more) <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PublicComments;
