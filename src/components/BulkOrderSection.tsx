import { useState } from "react";
import { Send } from "lucide-react";

const BulkOrderSection = () => {
  const [form, setForm] = useState({ name: "", phone: "", items: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*Bulk Order Request*\nName: ${form.name}\nPhone: ${form.phone}\nItems: ${form.items}\nMessage: ${form.message}`;
    window.open(`https://wa.me/9779852049458?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="bulk-order" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-body text-accent text-sm uppercase tracking-[0.2em] font-semibold mb-2">Bulk Orders</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Need Large Quantities?</h2>
          <p className="font-body text-muted-foreground mt-3 max-w-xl mx-auto">Fill out the form below and we'll get back to you on WhatsApp with the best pricing for your bulk order.</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-md p-8 space-y-5">
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
    </section>
  );
};

export default BulkOrderSection;
