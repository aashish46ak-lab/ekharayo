import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import { useSiteSettings, getBranding, getCompany, getSocial } from "@/hooks/useSiteSettings";

const SiteFooter = () => {
  const { settings } = useSiteSettings();
  const branding = getBranding(settings);
  const company = getCompany(settings);
  const social = getSocial(settings);
  const footerText = (settings.footer?.text as string) || "";

  const hasSocial = social.facebook || social.instagram || social.tiktok || social.youtube;

  return (
    <footer className="border-t border-border bg-card/50 py-8">
      <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-center">
        <Link to="/" className="inline-flex items-center">
          <img src={branding.logo_url || logo} alt={`eKharayo — ${company.company_name}`} className="h-10 w-auto" loading="lazy" />
        </Link>
        <p className="font-body text-xs text-muted-foreground max-w-md">
          {footerText ||
            "The official digital marketplace of Great Sagarmatha Trade Pvt. Ltd. — quality agricultural products from Nepal and trusted international suppliers."}
        </p>

        {hasSocial ? (
          <div className="flex items-center gap-3">
            {social.facebook ? (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={16} />
              </a>
            ) : null}
            {social.instagram ? (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={16} />
              </a>
            ) : null}
            {social.tiktok ? (
              <a href={social.tiktok} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle size={16} />
              </a>
            ) : null}
            {social.youtube ? (
              <a href={social.youtube} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={16} />
              </a>
            ) : null}
          </div>
        ) : null}

        <p className="font-body text-xs text-muted-foreground">
          © {new Date().getFullYear()} {company.company_name} (eKharayo). All Rights Reserved.
        </p>
        <p className="font-body text-[11px] text-muted-foreground/70">Developed by Ashish</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
