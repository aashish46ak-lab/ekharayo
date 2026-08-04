import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useWishlist = () => {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds([]);
      setReady(true);
      return;
    }
    supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setIds(((data ?? []) as { product_id: string }[]).map((r) => r.product_id));
        setReady(true);
      });
  }, [user]);

  const toggle = async (productId: string) => {
    if (!user) {
      toast.error("Please sign in to save products to your wishlist");
      return;
    }
    if (ids.includes(productId)) {
      setIds((p) => p.filter((i) => i !== productId));
      const { error } = await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
      if (error) toast.error(error.message);
      else toast.success("Removed from wishlist");
    } else {
      setIds((p) => [...p, productId]);
      const { error } = await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
      if (error) toast.error(error.message);
      else toast.success("Saved to wishlist");
    }
  };

  return { ids, toggle, has: (id: string) => ids.includes(id), ready };
};
