import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  user_id: string;
}

const Stars = ({ value, onChange, size = 16 }: { value: number; onChange?: (n: number) => void; size?: number }) => (
  <div className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange?.(n)}
        className={onChange ? "cursor-pointer" : "cursor-default"}
        aria-label={`${n} stars`}
      >
        <Star size={size} className={n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"} />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const { user, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("product_reviews" as never)
      .select("id,rating,title,body,created_at,user_id")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as unknown as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [productId]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return openAuthModal();
    setBusy(true);
    const { error } = await supabase.from("product_reviews" as never).upsert(
      {
        product_id: productId,
        user_id: user.id,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
      } as never,
      { onConflict: "product_id,user_id" },
    );
    setBusy(false);
    if (error) return toast.error(error.message || "Could not save review (run migration if table missing)");
    toast.success("Thanks for your rating!");
    setTitle("");
    setBody("");
    load();
  };

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Ratings & reviews</h2>
        {reviews.length > 0 && (
          <span className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground">
            <Stars value={Math.round(avg)} /> {avg.toFixed(1)} ({reviews.length})
          </span>
        )}
      </div>

      <form onSubmit={submit} className="bg-card border border-border rounded-xl p-5 mb-8 space-y-3 max-w-xl">
        <p className="font-body text-sm font-medium text-foreground">Write a review</p>
        <Stars value={rating} onChange={setRating} size={22} />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full border border-border rounded-lg px-3 py-2 font-body text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Share your experience…"
          className="w-full border border-border rounded-lg px-3 py-2 font-body text-sm bg-muted resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={16} /> : null} Submit rating
        </Button>
      </form>

      {loading ? (
        <Loader2 className="animate-spin text-primary" size={22} />
      ) : reviews.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">No reviews yet — be the first.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Stars value={r.rating} />
                <span className="font-body text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.title && <p className="font-display font-semibold text-sm text-foreground">{r.title}</p>}
              {r.body && <p className="font-body text-sm text-muted-foreground mt-1">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProductReviews;
