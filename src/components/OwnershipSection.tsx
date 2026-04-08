import founderImg from "@/assets/founder.jpg";
import { Phone, Mail, MessageCircle } from "lucide-react";

const OwnershipSection = () => {
  return (
    <section id="ownership" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-body text-accent text-sm uppercase tracking-[0.2em] font-semibold mb-2">Leadership</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Meet the Founder</h2>
        </div>

        <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/5">
              <img src={founderImg} alt="Founder of Great Himalayan Agro" loading="lazy" width={512} height={512} className="w-full h-64 md:h-full object-contain bg-secondary" />
            </div>
            <div className="p-8 md:w-3/5 flex flex-col justify-center">
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">Founder & CEO</h3>
              <p className="font-body text-primary font-semibold text-lg mb-1">Great Himalayan Agro</p>
              <p className="font-body text-muted-foreground mb-6">Bringing Nepal's freshest farm products to your home with trust and quality.</p>

              <div className="space-y-3">
                <a href="tel:9852049458" className="flex items-center gap-3 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors">
                  <Phone size={18} /> Call: 9852049458
                </a>
                <a href="tel:9802749458" className="flex items-center gap-3 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors">
                  <Phone size={18} /> Call: 9802749458
                </a>
                <a href="mailto:ghagro2080@gmail.com" className="flex items-center gap-3 bg-accent text-accent-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  <Mail size={18} /> Mail Us
                </a>
                <a href="https://wa.me/9779852049458" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[hsl(142_70%_45%)] text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  <MessageCircle size={18} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnershipSection;
