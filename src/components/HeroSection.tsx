import { Link } from "react-router-dom";
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
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">


      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="relative z-30 mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0s" }}
          >
            <SmartSearchBar variant="hero" />
          </div>


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

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Fresh from the
            <span
              className="block text-primary"
              style={{ filter: "drop-shadow(0 0 30px hsla(142,50%,38%,0.4))" }}
            >
              Sagarmatha Farm
            </span>
          </h1>

          <p
            className="font-body text-white/60 text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed tracking-wide opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            Great Sagarmatha Agro PVT. LTD. (eKharayo) — delivering the freshest
            dairy, meat & crop products across Nepal.
          </p>

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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="text-white/30" size={28} />
      </div>
    </section>
  );
};

export default HeroSection;
