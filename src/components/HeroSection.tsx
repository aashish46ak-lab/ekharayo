import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Play, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
  { value: "500+", label: "Happy Customers" },
  { value: "50+", label: "Products" },
  { value: "3+", label: "Years of Trust" },
];

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-screen cow grazing video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: `scale(1.08) translateY(${scrollY * 0.12}px)` }}
      >
        <source
          src="https://videos.pexels.com/video-files/5500637/5500637-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark semi-transparent overlays for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-md border border-card/20 rounded-full px-5 py-2 mb-8 opacity-0 animate-fade-in-up"
          >
            <span className="w-2 h-2 rounded-full bg-green-glow animate-pulse" />
            <span className="font-body text-green-glow text-xs uppercase tracking-[0.3em] font-semibold">
              Farm Fresh • Home Delivered
            </span>
          </div>

          {/* Headline with fade-in */}
          <h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-[1.08] mb-6 opacity-0 animate-fade-in-up tracking-tight"
            style={{ animationDelay: "0.15s" }}
          >
            Fresh from the
            <span className="block text-green-glow drop-shadow-[0_0_40px_hsl(var(--green-glow)/0.5)]">
              Himalayan Farm
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="font-body text-primary-foreground/70 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed tracking-wide opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Great Himalayan Agro PVT. LTD. (Kharayo) — delivering the freshest
            dairy, meat & crop products across Nepal.
          </p>

          {/* CTA with hover lift/glow */}
          <div
            className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-base hover:-translate-y-0.5 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.4)]"
            >
              Explore Products
              <Play size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://wa.me/9779852049458?text=Hi%20Kharayo!%20I%20want%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-card/15 backdrop-blur-md border border-card/25 text-primary-foreground font-body font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-base hover:-translate-y-0.5 hover:bg-card/25 hover:shadow-[0_8px_30px_hsl(var(--accent)/0.3)]"
            >
              Order on WhatsApp
            </a>
          </div>

          {/* Glassmorphism trust badges */}
          <div
            className="mt-14 flex flex-wrap justify-center gap-8 md:gap-14 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            {[
              { icon: Leaf, label: "100% Organic" },
              { icon: ShieldCheck, label: "Quality Guaranteed" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-card/10 backdrop-blur-md rounded-full px-5 py-2.5 border border-card/20">
                <Icon className="text-green-glow" size={22} />
                <span className="font-body text-primary-foreground/90 text-sm font-medium tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Glassmorphism stats bar */}
        <div
          className="mt-20 max-w-2xl mx-auto grid grid-cols-3 gap-4 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.75s" }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center bg-card/10 backdrop-blur-md rounded-xl py-5 border border-card/20">
              <div className="font-display text-2xl md:text-3xl font-extrabold text-green-glow mb-1">
                {value}
              </div>
              <div className="font-body text-primary-foreground/60 text-xs uppercase tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="text-primary-foreground/40" size={28} />
      </div>
    </section>
  );
};

export default HeroSection;
