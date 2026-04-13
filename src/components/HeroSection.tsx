import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown, ShoppingBasket, Info, Image, UserCircle, PackageCheck, Phone } from "lucide-react";
import SmartSearchBar from "./SmartSearchBar";

const menuItems = [
  { label: "Products", href: "/products", icon: ShoppingBasket },
  { label: "About", href: "/about", icon: Info },
  { label: "Gallery", href: "/gallery", icon: Image },
  { label: "Ownership", href: "/ownership", icon: UserCircle },
  { label: "Bulk Order", href: "/bulk-order", icon: PackageCheck },
  { label: "Contact", href: "/contact", icon: Phone },
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Cow grazing video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ transform: `scale(1.08) translateY(${scrollY * 0.06}px)`, filter: "blur(1.5px)" }}
        poster="https://images.pexels.com/videos/857251/free-video-857251.jpg?auto=compress&cs=tinysrgb&w=1280"
      >
        <source
          src="https://videos.pexels.com/video-files/857251/857251-sd_640_360_25fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/55" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">

          {/* Search bar - at top */}
          <div
            className="mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0s" }}
          >
            <SmartSearchBar variant="hero" />
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 opacity-0 animate-fade-in-up border border-primary/30"
            style={{
              background: "hsla(142, 50%, 38%, 0.12)",
              backdropFilter: "blur(12px)",
              animationDelay: "0.1s",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(142,50%,38%)]" />
            <span className="font-body text-primary text-xs uppercase tracking-[0.3em] font-semibold">
              Farm Fresh • Home Delivered
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Fresh from the
            <span
              className="block text-primary"
              style={{ filter: "drop-shadow(0 0 30px hsla(142,50%,38%,0.4))" }}
            >
              Himalayan Farm
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="font-body text-white/60 text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed tracking-wide opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            Great Himalayan Agro PVT. LTD. (Kharayo) — delivering the freshest
            dairy, meat & crop products across Nepal.
          </p>

          {/* Menu boxes grid */}
          <div
            className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-2xl mx-auto opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            {menuItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="group flex flex-col items-center gap-2 rounded-xl py-4 px-2 border border-white/10 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Icon className="text-primary group-hover:scale-110 transition-transform" size={22} />
                <span className="font-body text-white/80 text-[11px] font-medium tracking-wide group-hover:text-white transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
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
