import { Sprout, Heart, Truck } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-body text-accent text-sm uppercase tracking-[0.2em] font-semibold mb-2">About Us</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Why eKharayo Agro?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Sprout, title: "Farm to Table", desc: "We source directly from local Nepali farmers, ensuring freshness and fair prices for everyone." },
            { icon: Heart, title: "Quality Promise", desc: "Every product is carefully checked for quality — no chemicals, no shortcuts, just pure nature." },
            { icon: Truck, title: "Home Delivery", desc: "We deliver fresh products right to your doorstep across Nepal, fast and reliable." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-lg border border-border p-8 text-center shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5">
                <Icon className="text-primary" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
