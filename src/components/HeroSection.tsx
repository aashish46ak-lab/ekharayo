import { Link } from "react-router-dom";
import { ChevronDown, ShoppingBasket, Phone } from "lucide-react";
import SmartSearchBar from "./SmartSearchBar";
import heroBg from "@/assets/hero-bg.jpg";

/** Clean hero — no Products/About/Gallery label strip under the title */
const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-background">
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-background" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative z-30 mb-8 opacity-0 animate-fade-in-up">
            <SmartSearchBar variant="hero" />
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 opacity-0 animate-fade-in-up border border-primary/30"
            style={{ background: "hsla(142, 50%, 38%, 0.12)", backdropFilter: "blur(12px)", animationDelay: "0.1s" }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(142,50%,38%)]" />
            <span className="font-body text-primary text-xs uppercase tracking-[0.3em] font-semibold">
              Nepal&apos;s Agricultural Marketplace
            </span>
          </div>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Quality Agriculture,
            <span className="block text-primary" style={{ filter: "drop-shadow(0 0 30px hsla(142,50%,38%,0.4))" }}>
              One Trusted Platform
            </span>
          </h1>

          <p
            className="font-body text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed tracking-wide opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            eKharayo is the official digital marketplace of Great Sagarmatha Trade Pvt. Ltd. — farm-fresh products and
            trusted suppliers, delivered across Nepal.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-3.5 rounded-lg hover:bg-green-glow transition-colors shadow-lg shadow-primary/20"
            >
              <ShoppingBasket size={18} /> Shop products
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-white/25 text-white font-body font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Phone size={18} /> Contact us
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce pointer-events-none">
        <ChevronDown className="text-white/30" size={28} />
      </div>
    </section>
  );
};

export default HeroSection;
