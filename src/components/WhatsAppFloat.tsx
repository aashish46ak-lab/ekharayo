import { MessageCircle } from "lucide-react";
import { useSiteSettings, getCompany, getSocial, waLink } from "@/hooks/useSiteSettings";

const WhatsAppFloat = () => {
  const { settings } = useSiteSettings();
  const company = getCompany(settings);
  const social = getSocial(settings);
  const phone = social.whatsapp || company.whatsapp || company.phone1 || "9852049458";
  const href = waLink(phone) || `https://wa.me/977${String(phone).replace(/\D/g, "").slice(-10)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 hover:scale-105 transition-transform"
    >
      <MessageCircle size={26} fill="currentColor" />
    </a>
  );
};

export default WhatsAppFloat;
