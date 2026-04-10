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
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105"
        style={{ transform: `scale(1.05) translateY(${scrollY * 0.15}px)` }}
        poster=""
      >
        <source
          src="https://videos.pexels.com/video-files/2889842/2889842-hd_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Multi-layer overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-overlay)/0.75)] via-[hsl(var(--hero-overlay)/0.5)] to-[hsl(var(--hero-overlay)/0.85)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] to-transparent" />

      {/* Animated grain texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-glow animate-pulse" />
            <span className="font-body text-green-glow text-xs uppercase tracking-[0.25em] font-semibold">
              Farm Fresh • Home Delivered
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-[1.1] mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            Fresh from the
            <span className="block text-green-glow drop-shadow-[0_0_30px_hsl(var(--green-glow)/0.4)]">
              Himalayan Farm
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="font-body text-primary-foreground/75 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Great Himalayan Agro PVT. LTD. (Kharayo) — delivering the freshest
            dairy, meat & crop products across Nepal.
          </p>

          {/* CTA */}
          <div
            className="flex flex-wrap justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-4 rounded-xl hover:bg-green-glow hover:shadow-[0_0_30px_hsl(var(--green-glow)/0.4)] transition-all duration-300 text-base"
            >
              Explore Products
              <Play size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://wa.me/9779852049458?text=Hi%20Kharayo!%20I%20want%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent/90 backdrop-blur-sm text-accent-foreground font-body font-semibold px-8 py-4 rounded-xl hover:bg-accent hover:shadow-[0_0_30px_hsl(var(--accent)/0.3)] transition-all duration-300 text-base"
            >
              Order on WhatsApp
            </a>
          </div>

          {/* Trust badges */}
          <div
            className="mt-14 flex flex-wrap justify-center gap-8 md:gap-14 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            {[
              { icon: Leaf, label: "100% Organic" },
              { icon: ShieldCheck, label: "Quality Guaranteed" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-primary-foreground/5 backdrop-blur-sm rounded-full px-5 py-2.5 border border-primary-foreground/10">
                <Icon className="text-green-glow" size={22} />
                <span className="font-body text-primary-foreground/90 text-sm font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="mt-20 max-w-2xl mx-auto grid grid-cols-3 gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.75s" }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center bg-primary-foreground/5 backdrop-blur-sm rounded-xl py-5 border border-primary-foreground/10">
              <div className="font-display text-2xl md:text-3xl font-extrabold text-green-glow mb-1">
                {value}
              </div>
              <div className="font-body text-primary-foreground/60 text-xs uppercase tracking-wider">
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
