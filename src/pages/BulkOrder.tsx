import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import { useEffect, useMemo, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BulkOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number; sale_price: number | null; category_id: string | null }[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", address: "", category: "", product: "", quantity: 1, message: "" });
  useEffect(() => { Promise.all([supabase.from("categories").select("id,name").order("name"), supabase.from("products").select("id,name,price,sale_price,category_id").eq("is_active", true)]).then(([c, p]) => { setCategories(c.data ?? []); setProducts((p.data as typeof products) ?? []); }); }, []);
  const selected = products.find((p) => p.id === form.product);
  const unitPrice = Number(selected?.sale_price ?? selected?.price ?? 0);
  const total = useMemo(() => unitPrice * Math.max(Number(form.quantity) || 0, 0), [unitPrice, form.quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth?next=/bulk-order");
      return;
    }
    setBusy(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: form.name,
        customer_email: form.email || user.email || "",
        customer_phone: form.phone,
        address_line: form.address,
        city: form.city,
        notes: `BULK ORDER\n${form.message}`,
        payment_method: "cod",
        subtotal: total,
        total,
      })
      .select()
      .single();

    if (error || !order) {
      setBusy(false);
      return toast.error(error?.message ?? "Could not submit request");
    }

    await supabase.from("order_items").insert({
      order_id: order.id,
       product_id: selected?.id,
       product_name: selected?.name ?? "Bulk order",
       quantity: form.quantity,
       unit_price: unitPrice,
       line_total: total,
    });

    setBusy(false);
    toast.success("Bulk order request submitted — our team will contact you shortly.");
    navigate(`/order-confirmation/${order.id}`);
  };

  const field = "w-full border border-border rounded-lg px-4 py-3 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Bulk Orders" subtitle="Need large quantities? We offer the best pricing for bulk purchases">
        <div className="container mx-auto px-4 py-16">
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-xl shadow-primary/5 p-8 space-y-5">
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Your Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} placeholder="Enter your name" />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Phone Number</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} placeholder="you@example.com" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground block mb-1">City</label>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={field} placeholder="Biratnagar" />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground block mb-1">Delivery Address</label>
                <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={field} placeholder="Street, ward" />
              </div>
            </div>
             <div className="grid sm:grid-cols-3 gap-4">
               <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, product: "" })} className={field}><option value="">Category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
               <select required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className={field}><option value="">Product</option>{products.filter((p) => !form.category || p.category_id === form.category).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
               <input required min={1} type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className={field} placeholder="Quantity" />
             </div>
             <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-4"><span className="text-sm text-muted-foreground">Estimated total</span><strong className="text-xl text-primary">Rs. {total.toLocaleString("en-IN")}</strong></div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Additional Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className={`${field} resize-none`} placeholder="Any special instructions..." />
            </div>
            <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-4 rounded-lg hover:bg-green-glow transition-colors text-base disabled:opacity-60">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Submit Bulk Order Request
            </button>
            {!user && <p className="font-body text-xs text-muted-foreground text-center">You'll be asked to sign in with your email before submitting.</p>}
          </form>
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default BulkOrder;
