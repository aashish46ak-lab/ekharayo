import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { useState } from "react";
import { Send } from "lucide-react";

const BulkOrder = () => {
  const [form, setForm] = useState({ name: "", phone: "", items: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*Bulk Order Request*\nName: ${form.name}\nPhone: ${form.phone}\nItems: ${form.items}\nMessage: ${form.message}`;
    window.open(`https://wa.me/9779852049458?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Bulk Orders" subtitle="Need large quantities? We offer the best pricing for bulk purchases">
        <div className="container mx-auto px-4 py-16">
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-xl p-8 space-y-5">
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Your Name</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-input rounded-lg px-4 py-3 font-body text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter your name" />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Phone Number</label>
              <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-input rounded-lg px-4 py-3 font-body text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Items Required</label>
              <input required value={form.items} onChange={e => setForm({...form, items: e.target.value})} className="w-full border border-input rounded-lg px-4 py-3 font-body text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., 50kg Rice, 20L Milk" />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1">Additional Message</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} className="w-full border border-input rounded-lg px-4 py-3 font-body text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Any special instructions..." />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-4 rounded-lg hover:bg-green-glow transition-colors text-base">
              <Send size={18} /> Send Order via WhatsApp
            </button>
          </form>
        </div>
      </PageShell>
      <ContactFooter />
      <ScrollToTop />
    </div>
  );
};

export default BulkOrder;
