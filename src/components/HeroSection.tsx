import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Play, ChevronDown, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
  { value: "500+", label: "Happy Customers" },
  { value: "50+", label: "Products" },
  { value: "3+", label: "Years of Trust" },
];

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a1a0f]">
      {/* Full-screen video background — cow grazing */}
      <video
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ transform: `scale(1.05) translateY(${scrollY * 0.1}px)` }}
      >
        <source
          src="https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_25fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(142,50%,15%)]/30 to-transparent" />

      {/* Futuristic grid lines overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Glowing badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 opacity-0 animate-fade-in-up border border-emerald-400/30"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.15), inset 0 0 20px rgba(16, 185, 129, 0.05)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-body text-emerald-300 text-xs uppercase tracking-[0.3em] font-semibold">
              Farm Fresh • Home Delivered
            </span>
          </div>

          {/* Bold headline */}
          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            Fresh from the
            <span
              className="block bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.4))" }}
            >
              Himalayan Farm
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="font-body text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed tracking-wide opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Great Himalayan Agro PVT. LTD. (Kharayo) — delivering the freshest
            dairy, meat & crop products across Nepal.
          </p>

          {/* CTA buttons with hover glow */}
          <div
            className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 font-body font-semibold px-8 py-4 rounded-xl text-base text-white transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, hsl(142, 50%, 28%), hsl(142, 60%, 35%))",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 40px rgba(16,185,129,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.3)";
              }}
            >
              Explore Products
              <Play size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://wa.me/9779852049458?text=Hi%20Kharayo!%20I%20want%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body font-semibold px-8 py-4 rounded-xl text-base text-white transition-all duration-300 hover:-translate-y-1 border border-white/20"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Order on WhatsApp
            </a>
          </div>

          {/* Glassmorphism trust badges */}
          <div
            className="mt-14 flex flex-wrap justify-center gap-6 md:gap-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            {[
              { icon: Leaf, label: "100% Organic" },
              { icon: ShieldCheck, label: "Quality Guaranteed" },
              { icon: Truck, label: "Home Delivery" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-full px-5 py-2.5 border border-white/10"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Icon className="text-emerald-400" size={20} />
                <span className="font-body text-white/80 text-sm font-medium tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Glassmorphism stats bar */}
        <div
          className="mt-20 max-w-2xl mx-auto grid grid-cols-3 gap-3 md:gap-4 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.75s" }}
        >
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="text-center rounded-2xl py-5 md:py-6 border border-white/10 transition-all duration-300 hover:border-emerald-400/30"
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="font-display text-2xl md:text-4xl font-extrabold mb-1 bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent"
              >
                {value}
              </div>
              <div className="font-body text-white/50 text-[10px] md:text-xs uppercase tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="text-white/30" size={28} />
      </div>
    </section>
  );
};

export default HeroSection;
