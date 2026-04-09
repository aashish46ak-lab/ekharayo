import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { Sprout, Heart, Truck, Users } from "lucide-react";

const values = [
  { icon: Sprout, title: "Farm to Table", desc: "We source directly from local Nepali farmers, ensuring freshness and fair prices for everyone." },
  { icon: Heart, title: "Quality Promise", desc: "Every product is carefully checked for quality — no chemicals, no shortcuts, just pure nature." },
  { icon: Truck, title: "Fast Delivery", desc: "We deliver fresh products straight to your doorstep across Nepal with care and speed." },
  { icon: Users, title: "Community First", desc: "We empower local farmers by giving them a fair market and supporting sustainable agriculture." },
];

const About = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <PageShell title="About Us" subtitle="Learn why Great Himalayan Agro PVT. LTD. is Nepal's trusted farm brand">
      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-xl border border-border p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Icon className="text-primary" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
    <ContactFooter />
    <ScrollToTop />
  </div>
);

export default About;
