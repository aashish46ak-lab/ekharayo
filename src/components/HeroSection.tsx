import { Link } from "react-router-dom";
import { ShoppingBasket, Phone, UserCircle, Image } from "lucide-react";
import SmartSearchBar from "./SmartSearchBar";
import { useLang } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLang();

  const boxes = [
    { to: "/products", icon: ShoppingBasket, title: t("shop"), desc: t("buyProductsDesc") },
    { to: "/gallery", icon: Image, title: t("gallery"), desc: t("galleryDesc") },
    { to: "/ownership", icon: UserCircle, title: t("ownership"), desc: t("ownershipDesc") },
    { to: "/contact", icon: Phone, title: t("contact"), desc: t("contactDesc") },
  ];

  return (
    <section className="relative min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#070b12]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05080e] via-[#070b12] to-[#0a0f18]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative z-30 mb-5 opacity-0 animate-fade-in-up">
            <SmartSearchBar variant="hero" />
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 opacity-0 animate-fade-in-up border border-primary/25"
            style={{ background: "hsla(142, 50%, 38%, 0.1)", animationDelay: "0.1s" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-body text-primary text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold">
              {t("heroBadge")}
            </span>
          </div>

          <h1
            className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] mb-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {t("heroTitle1")}
            <span className="block text-primary">{t("heroTitle2")}</span>
          </h1>

          <p
            className="font-body text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingBasket size={16} /> {t("shop")}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-border text-foreground font-body text-sm font-semibold px-6 py-3 rounded-lg hover:border-primary/40 transition-colors"
            >
              {t("contact")}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
            {boxes.map(({ to, icon: Icon, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4 text-left hover:border-primary/40 hover:bg-card/70 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-2">
                  <Icon className="text-primary" size={20} />
                </div>
                <p className="font-display font-bold text-sm text-foreground">{title}</p>
                <p className="font-body text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
