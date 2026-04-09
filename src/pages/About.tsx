import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import { Link } from "react-router-dom";
import { Sprout, Heart, Truck, Users, MapPin, Factory, Tractor, UserCircle } from "lucide-react";

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
      <div className="container mx-auto px-4 py-16 space-y-16">

        {/* Company intro */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="font-body text-base text-foreground leading-relaxed">
            <strong className="text-primary">Great Himalayan Agro PVT. LTD. (Kharayo)</strong> is a registered agro-based company dedicated to producing and delivering fresh, organic farm products across Nepal. From dairy and poultry to crops and livestock — we bring the best of Nepali agriculture directly to your home.
          </p>
          <p className="font-body text-base text-foreground leading-relaxed">
            We operate our own <strong>farms and mills</strong>, ensuring complete control over quality from production to delivery. Our integrated facilities include cattle farms, poultry sheds, crop fields, and modern processing mills — all managed with sustainable farming practices.
          </p>
        </div>

        {/* Location */}
        <div className="max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-md p-8 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-primary" size={28} />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Our Location</h3>
          <p className="font-body text-muted-foreground">
            Patharishanishchare-5, Morang, Nepal
          </p>
        </div>

        {/* Facilities */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <Tractor className="text-primary mx-auto mb-3" size={32} />
            <h4 className="font-display text-lg font-bold text-foreground mb-1">Our Farms</h4>
            <p className="font-body text-sm text-muted-foreground">Cattle, poultry, and crop farms managed with sustainable practices.</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <Factory className="text-primary mx-auto mb-3" size={32} />
            <h4 className="font-display text-lg font-bold text-foreground mb-1">Our Mills</h4>
            <p className="font-body text-sm text-muted-foreground">Modern processing mills for rice, wheat, and other grains.</p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground text-center mb-8">What We Stand For</h3>
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

        {/* View Ownership CTA */}
        <div className="text-center">
          <Link
            to="/ownership"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-4 rounded-lg hover:bg-green-glow transition-colors text-base"
          >
            <UserCircle size={20} /> View Ownership
          </Link>
        </div>

      </div>
    </PageShell>
    <ScrollToTop />
  </div>
);

export default About;
