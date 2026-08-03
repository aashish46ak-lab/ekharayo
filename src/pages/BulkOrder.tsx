import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BulkOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", address: "", items: "", message: "" });

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
        notes: `BULK ORDER REQUEST\nItems: ${form.items}\n${form.message}`,
        payment_method: "quote",
        subtotal: 0,
        total: 0,
      })
      .select()
      .single();

    if (error || !order) {
      setBusy(false);
      return toast.error(error?.message ?? "Could not submit request");
    }

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_name: `Bulk request: ${form.items}`,
      quantity: 1,
      unit_price: 0,
      line_total: 0,
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
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Items Required</label>
              <input required value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} className={field} placeholder="e.g., 50kg Rice, 20L Milk" />
            </div>
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
