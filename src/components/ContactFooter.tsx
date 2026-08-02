import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";

const ContactFooter = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground">Get In Touch</h2>
          <p className="font-body text-muted-foreground mt-2">We'd love to hear from you</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <a href="tel:9852049458" className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <Phone className="text-primary" size={24} />
            <span className="font-body text-sm font-medium text-foreground">9852049458</span>
          </a>
          <a href="tel:9802749458" className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <Phone className="text-primary" size={24} />
            <span className="font-body text-sm font-medium text-foreground">9802749458</span>
          </a>
          <a href="mailto:ghagro2080@gmail.com" className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <Mail className="text-primary" size={24} />
            <span className="font-body text-sm font-medium text-foreground">Mail Us</span>
          </a>
          <a href="https://wa.me/9779852049458" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <MessageCircle className="text-primary" size={24} />
            <span className="font-body text-sm font-medium text-foreground">WhatsApp</span>
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
          <MapPin size={16} />
          <span className="font-body text-sm">Patharishanishchare-5, Morang, Nepal</span>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="font-body text-sm text-muted-foreground">© 2026 Great Sagarmatha Traders PVT LTD (eKharayo). All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactFooter;
