import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import founderImg from "@/assets/founder.jpg";
import { Link } from "react-router-dom";
import { Phone, Mail, ShoppingBasket, Globe, Facebook, Instagram, MessageCircle, MapPin, Clock, ExternalLink } from "lucide-react";
import { useSiteSettings, getOwner, getCompany, getLocation } from "@/hooks/useSiteSettings";
import { useLang } from "@/i18n/LanguageContext";

const Ownership = () => {
  const { t } = useLang();
  const { settings } = useSiteSettings();
  const owner = getOwner(settings);
  const company = getCompany(settings);
  const location = getLocation(settings);

  const photo = owner.photo_url || founderImg;
  const companyName = owner.company || company.company_name;
  const bio = owner.bio || company.about;

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title={t("ownTitle")} subtitle={t("ownSub")}>
        <div className="container mx-auto px-4 py-16 space-y-8">
          <p className="max-w-3xl mx-auto font-body text-sm text-muted-foreground text-center leading-relaxed">{t("ownIntro")}</p>
          <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border shadow-xl shadow-primary/5 overflow-hidden">
            {owner.cover_url ? (
              <img src={owner.cover_url} alt="Cover" className="w-full h-32 md:h-40 object-cover" loading="lazy" />
            ) : null}
            <div className="md:flex">
              <div className="md:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-secondary">
                <img src={photo} alt={`${owner.name} — ${companyName}`} loading="lazy" className="w-60 h-68 md:w-64 md:h-76 rounded-2xl object-cover border-4 border-primary/30 shadow-lg" />
              </div>
              <div className="p-8 md:w-3/5 flex flex-col justify-center">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">{owner.name}</h3>
                <p className="font-body text-primary font-semibold text-sm mb-1">{owner.position}</p>
                {companyName ? <p className="font-body text-muted-foreground font-semibold mb-3">{companyName}</p> : null}
                {(owner.welcome || bio) ? (
                  <p className="font-body text-muted-foreground mb-6 whitespace-pre-line">{owner.welcome || bio}</p>
                ) : (
                  <p className="font-body text-muted-foreground mb-6">{t("ownFounderBody")}</p>
                )}
                <div className="space-y-3">
                  {owner.phone1 ? (
                    <a href={`tel:${owner.phone1}`} className="flex items-center gap-3 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors">
                      <Phone size={18} /> {owner.phone1}
                    </a>
                  ) : null}
                  {owner.phone2 ? (
                    <a href={`tel:${owner.phone2}`} className="flex items-center gap-3 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors">
                      <Phone size={18} /> {owner.phone2}
                    </a>
                  ) : null}
                  {owner.email ? (
                    <a href={`mailto:${owner.email}`} className="flex items-center gap-3 bg-accent text-accent-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-opacity">
                      <Mail size={18} /> {owner.email}
                    </a>
                  ) : null}
                  {owner.website ? (
                    <a href={owner.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 border border-border text-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:border-primary/40 transition-colors">
                      <Globe size={18} /> Website
                    </a>
                  ) : null}
                  <Link to="/products" className="flex items-center gap-3 bg-primary/80 text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:bg-primary transition-colors">
                    <ShoppingBasket size={18} /> {t("shop")}
                  </Link>
                </div>

                {(owner.facebook || owner.instagram || owner.tiktok) ? (
                  <div className="flex items-center gap-3 mt-5">
                    {owner.facebook ? (
                      <a href={owner.facebook} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-muted text-foreground hover:text-primary transition-colors">
                        <Facebook size={18} />
                      </a>
                    ) : null}
                    {owner.instagram ? (
                      <a href={owner.instagram} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-muted text-foreground hover:text-primary transition-colors">
                        <Instagram size={18} />
                      </a>
                    ) : null}
                    {owner.tiktok ? (
                      <a href={owner.tiktok} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-muted text-foreground hover:text-primary transition-colors">
                        <MessageCircle size={18} />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {company.about ? (
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border p-8 space-y-3">
              <h3 className="font-display text-xl font-bold text-foreground">{t("ownCompany")} — {company.company_name}</h3>
              {company.tagline ? <p className="font-body text-primary text-sm font-semibold">{company.tagline}</p> : null}
              <p className="font-body text-muted-foreground whitespace-pre-line">{company.about}</p>
              {company.business_hours ? (
                <p className="flex items-center gap-2 font-body text-sm text-muted-foreground pt-2">
                  <Clock size={16} className="text-primary" /> {company.business_hours}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border p-8 space-y-3">
              <h3 className="font-display text-xl font-bold text-foreground">{t("ownCompany")}</h3>
              <p className="font-body text-muted-foreground">{t("ownCompanyBody")}</p>
            </div>
          )}

          {(location.google_maps_embed || owner.map_url || location.google_maps_url) ? (
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border p-8 space-y-4">
              <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> Map
              </h3>
              {(owner.address || location.address) ? (
                <p className="font-body text-sm text-muted-foreground">{owner.address || location.address}</p>
              ) : null}
              {location.google_maps_embed ? (
                <iframe src={location.google_maps_embed} className="w-full h-72 rounded-xl border border-border" loading="lazy" title="Location map" />
              ) : (owner.map_url || location.google_maps_url) ? (
                <a href={owner.map_url || location.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors">
                  <ExternalLink size={16} /> Google Maps
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Ownership;
