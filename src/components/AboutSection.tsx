import { Sprout, Heart } from "lucide-react";
import farm1 from "@/assets/farm1.jpg";
import farm2 from "@/assets/farm2.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-body text-accent text-sm uppercase tracking-[0.2em] font-semibold mb-2">About Us</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground"><h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Why Great Himalayan Agro PVT. LTD.?</h2></h2>
        </div>

        {/* Farm gallery */}
        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto mb-14 rounded-2xl overflow-hidden">
          <img src={farm1} alt="Our farm facility" loading="lazy" width={640} height={480} className="w-full h-48 md:h-64 object-cover" />
          <img src={farm2} alt="Our cattle shed" loading="lazy" width={640} height={480} className="w-full h-48 md:h-64 object-cover" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {[
            { icon: Sprout, title: "Farm to Table", desc: "We source directly from local Nepali farmers, ensuring freshness and fair prices for everyone." },
            { icon: Heart, title: "Quality Promise", desc: "Every product is carefully checked for quality — no chemicals, no shortcuts, just pure nature." },
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
