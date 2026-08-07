import { Link } from "react-router-dom";
import { ShoppingBasket, Phone, UserCircle, Image } from "lucide-react";
import SmartSearchBar from "./SmartSearchBar";
import { useLang } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLang();

  const boxes = [
    { to: "/ownership", icon: UserCircle, title: t("ownership"), desc: t("ownershipDesc") },
    { to: "/gallery", icon: Image, title: t("gallery"), desc: t("galleryDesc") },
    { to: "/contact", icon: Phone, title: t("contact"), desc: t("contactDesc") },
    { to: "/products", icon: ShoppingBasket, title: t("shop"), desc: t("buyProductsDesc") },
  ];

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-[#070b12]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05080e] via-[#070b12] to-[#0a0f18]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative z-30 mb-6 opacity-0 animate-fade-in-up">
            <SmartSearchBar variant="hero" />
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 opacity-0 animate-fade-in-up border border-primary/25"
            style={{ background: "hsla(142, 50%, 38%, 0.1)", animationDelay: "0.1s" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-body text-primary text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold">
              {t("heroBadge")}
            </span>
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.08] mb-5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {t("heroTitle1")}
            <span className="block text-primary">{t("heroTitle2")}</span>
          </h1>

          <p
            className="font-body text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            {t("heroSub")}
          </p>

          <div
            className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            {boxes.map(({ to, icon: Icon, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="group aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/60 px-3 py-4 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-lg shadow-black/20"
              >
                <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:scale-110 transition-transform">
                  <Icon size={22} />
                </span>
                <span className="font-display text-sm sm:text-base font-bold text-foreground text-center leading-tight">
                  {title}
                </span>
                <span className="font-body text-[10px] sm:text-xs text-muted-foreground text-center leading-snug">
                  {desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
