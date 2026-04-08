import heroBg from "@/assets/hero-bg.jpg";
import { Truck, Leaf, ShieldCheck } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <img src={heroBg} alt="Fresh farms of Nepal" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[hsl(var(--hero-overlay)/0.7)]" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <p className="font-body text-green-glow text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in-up">Farm Fresh • Home Delivered</p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          Fresh from the Farm,<br />Straight to Your Door
        </h1>
        <p className="font-body text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          Great Himalayan Agro (Kharayo) delivers the freshest dairy, meat, and crop products across Nepal — quality you can taste, service you can trust.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          <a href="#products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-4 rounded-lg hover:bg-green-glow transition-colors text-base">
            Explore Products
          </a>
          <a href="https://wa.me/9779852049458?text=Hi%20eKharayo%20Agro!%20I%20want%20to%20place%20an%20order." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-base">
            Order on WhatsApp
          </a>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          {[
            { icon: Leaf, label: "100% Organic" },
            { icon: ShieldCheck, label: "Quality Guaranteed" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="text-green-glow" size={28} />
              <span className="font-body text-primary-foreground/90 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
