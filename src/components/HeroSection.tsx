import { Link } from "react-router-dom";
import { ChevronDown, ShoppingBasket, ArrowRight } from "lucide-react";
import SmartSearchBar from "./SmartSearchBar";

/**
 * Dark hero — primary action is View Products → separate /products page
 * (not inline product list on home)
 */
const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b12] via-[#0a0f18] to-background" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[110px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative z-30 mb-8 opacity-0 animate-fade-in-up">
            <SmartSearchBar variant="hero" />
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 opacity-0 animate-fade-in-up border border-primary/30"
            style={{ background: "hsla(142, 50%, 38%, 0.12)", animationDelay: "0.1s" }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-body text-primary text-xs uppercase tracking-[0.3em] font-semibold">
              Nepal&apos;s Agricultural Marketplace
            </span>
          </div>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-[1.05] mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Quality Agriculture,
            <span className="block text-primary">One Trusted Platform</span>
          </h1>

          <p
            className="font-body text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            Official marketplace of Great Sagarmatha Trade Pvt. Ltd. — quality farm products delivered across Nepal.
          </p>

          {/* View Products box → opens separate /products page */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Link
              to="/products"
              className="group mx-auto max-w-md flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-card/80 px-8 py-7 shadow-lg shadow-primary/10 hover:border-primary hover:bg-primary/10 transition-all duration-300"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                <ShoppingBasket size={28} />
              </span>
              <span className="font-display text-xl font-bold text-foreground">View Products</span>
              <span className="font-body text-sm text-muted-foreground">
                Open full catalogue on a separate page
              </span>
              <span className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary">
                Go to products <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce pointer-events-none">
        <ChevronDown className="text-muted-foreground/30" size={28} />
      </div>
    </section>
  );
};

export default HeroSection;
