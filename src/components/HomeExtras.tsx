import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { ArrowRight, BadgeCheck, Headset, ShieldCheck, Sparkles, Quote, MapPin, CheckCircle2 } from "lucide-react";

const HomeExtras = () => {
  const { t } = useLang();

  const reasons = [
    { icon: BadgeCheck, title: t("trusted"), desc: t("trustedDesc") },
    { icon: ShieldCheck, title: t("quality"), desc: t("qualityDesc") },
    { icon: Headset, title: t("support"), desc: t("supportDesc") },
    { icon: Sparkles, title: t("growing"), desc: t("growingDesc") },
  ];

  const comments = [
    { body: t("c1"), name: t("c1n") },
    { body: t("c2"), name: t("c2n") },
    { body: t("c3"), name: t("c3n") },
  ];

  const points = [t("detailPoint1"), t("detailPoint2"), t("detailPoint3"), t("detailPoint4")];

  return (
    <div className="bg-background">
      <section className="container mx-auto px-4 py-14 sm:py-16">
        <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t("detailTitle")}</h2>
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{t("detailBody")}</p>
            </div>
          </div>
          <ul className="mt-5 grid sm:grid-cols-2 gap-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 font-body text-sm text-foreground/85">
                <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={16} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-glow transition-colors">
              {t("shop")} <ArrowRight size={14} />
            </Link>
            <Link to="/ownership" className="inline-flex items-center gap-2 border border-border text-foreground font-body text-sm font-semibold px-5 py-2.5 rounded-lg hover:border-primary/40 transition-colors">
              {t("ownership")}
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-border text-foreground font-body text-sm font-semibold px-5 py-2.5 rounded-lg hover:border-primary/40 transition-colors">
              {t("contact")}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-14 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">{t("why")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-colors">
                <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <Icon className="text-primary" size={20} />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1 text-sm">{title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{t("commentsTitle")}</h2>
          <p className="font-body text-sm text-muted-foreground mt-2">{t("commentsSub")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {comments.map((c) => (
            <blockquote key={c.name} className="bg-card border border-border rounded-2xl p-5 text-left">
              <Quote className="text-primary/40 mb-2" size={20} />
              <p className="font-body text-sm text-foreground/90 leading-relaxed mb-4">{c.body}</p>
              <footer className="font-body text-xs font-semibold text-primary">{c.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeExtras;
