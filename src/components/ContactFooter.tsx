import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";

const ContactFooter = () => {
  return (
    <footer id="contact" className="bg-[hsl(var(--hero-overlay))] text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold">Get In Touch</h2>
          <p className="font-body text-primary-foreground/70 mt-2">We'd love to hear from you</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <a href="tel:9852049458" className="flex flex-col items-center gap-2 bg-primary-foreground/10 rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors">
            <Phone size={24} />
            <span className="font-body text-sm font-medium">9852049458</span>
          </a>
          <a href="tel:9802749458" className="flex flex-col items-center gap-2 bg-primary-foreground/10 rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors">
            <Phone size={24} />
            <span className="font-body text-sm font-medium">9802749458</span>
          </a>
          <a href="mailto:ghagro2080@gmail.com" className="flex flex-col items-center gap-2 bg-primary-foreground/10 rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors">
            <Mail size={24} />
            <span className="font-body text-sm font-medium">Mail Us</span>
          </a>
          <a href="https://wa.me/9779852049458" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 bg-primary-foreground/10 rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors">
            <MessageCircle size={24} />
            <span className="font-body text-sm font-medium">WhatsApp</span>
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-primary-foreground/60 mb-8">
          <MapPin size={16} />
          <span className="font-body text-sm">Nepal</span>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-center">
          <p className="font-body text-sm text-primary-foreground/50">© 2024 eKharayo Agro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooter;
