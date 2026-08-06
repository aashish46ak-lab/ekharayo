import { Link } from "react-router-dom";
import { Phone, Mail, ShoppingBasket, MapPin, Clock, MessageCircle, Facebook, Instagram, ExternalLink } from "lucide-react";
import { useSiteSettings, getContact, getCompany, getLocation, getSocial, composeAddress, waLink } from "@/hooks/useSiteSettings";

const ContactFooter = () => {
  const { settings } = useSiteSettings();
  const contact = getContact(settings);
  const company = getCompany(settings);
  const location = getLocation(settings);
  const social = getSocial(settings);

  const address = composeAddress(location, contact.address);
  const whatsapp = social.whatsapp || company.whatsapp;
  const email = contact.email || company.email;
  const phone1 = contact.phone1 || company.phone1;
  const phone2 = contact.phone2 || company.phone2;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground">Get In Touch</h2>
          <p className="font-body text-muted-foreground mt-2">We'd love to hear from you</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
          {phone1 ? (
            <a href={`tel:${phone1}`} className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <Phone className="text-primary" size={24} />
              <span className="font-body text-sm font-medium text-foreground">{phone1}</span>
            </a>
          ) : null}
          {phone2 ? (
            <a href={`tel:${phone2}`} className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <Phone className="text-primary" size={24} />
              <span className="font-body text-sm font-medium text-foreground">{phone2}</span>
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <Mail className="text-primary" size={24} />
              <span className="font-body text-sm font-medium text-foreground">Mail Us</span>
            </a>
          ) : null}
          {whatsapp ? (
            <a href={waLink(whatsapp)} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <MessageCircle className="text-primary" size={24} />
              <span className="font-body text-sm font-medium text-foreground">WhatsApp</span>
            </a>
          ) : null}
          <Link to="/products" className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <ShoppingBasket className="text-primary" size={24} />
            <span className="font-body text-sm font-medium text-foreground">Order Online</span>
          </Link>
        </div>

        {(social.facebook || social.instagram) ? (
          <div className="flex items-center justify-center gap-3 mb-8">
            {social.facebook ? (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-card border border-border text-foreground hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
            ) : null}
            {social.instagram ? (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-card border border-border text-foreground hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
          <MapPin size={16} />
          <span className="font-body text-sm">{address}</span>
        </div>

        {company.business_hours ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
            <Clock size={16} />
            <span className="font-body text-sm">{company.business_hours}</span>
          </div>
        ) : (
          <div className="mb-8" />
        )}

        {(location.google_maps_embed || location.google_maps_url) ? (
          <div className="max-w-3xl mx-auto mb-8">
            {location.google_maps_embed ? (
              <iframe src={location.google_maps_embed} className="w-full h-72 rounded-xl border border-border" loading="lazy" title="Location map" />
            ) : (
              <div className="text-center">
                <a href={location.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-3 rounded-lg hover:bg-green-glow transition-colors">
                  <ExternalLink size={16} /> Open in Google Maps
                </a>
              </div>
            )}
          </div>
        ) : null}

        <div className="border-t border-border pt-6 text-center">
          <p className="font-body text-sm text-muted-foreground">© 2026 {company.company_name} (eKharayo). All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactFooter;
