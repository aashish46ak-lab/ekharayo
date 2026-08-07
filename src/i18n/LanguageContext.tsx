import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "en" | "ne";

const dict = {
  en: {
    shop: "Buy Products",
    contact: "Contact Me",
    about: "About Us",
    ownership: "Ownership",
    home: "Home",
    products: "Products",
    gallery: "Gallery",
    bulk: "Bulk Order",
    cart: "Cart",
    wishlist: "Wishlist",
    orders: "My Orders",
    signIn: "Sign in",
    signOut: "Sign out",
    admin: "Admin",
    search: "Search products…",
    shopByCategory: "Shop by category",
    featured: "Featured products",
    why: "Why eKharayo",
    allProducts: "All products",
    viewAll: "View all",
    trackOnMap: "Track on map",
    deliveryFrom: "Delivery from Morang HQ",
    outOfStock: "Out of stock",
    inStock: "In stock",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    heroBadge: "Nepal's Agricultural Marketplace",
    heroTitle1: "Quality Agriculture,",
    heroTitle2: "One Trusted Platform",
    heroSub:
      "Official marketplace of Great Sagarmatha Trade Pvt. Ltd. — quality farm products delivered across Nepal.",
    buyProductsDesc: "Browse full catalogue",
    contactDesc: "Phone, WhatsApp & email",
    ownershipDesc: "Company ownership",
    aboutDesc: "Our story & mission",
    commentsTitle: "What customers say",
    commentsSub: "Real feedback from buyers across Nepal",
    c1: "Fresh products and honest pricing. Delivery reached Biratnagar on time.",
    c1n: "Ramesh K., Biratnagar",
    c2: "Easy to order dairy and poultry. Support answered on WhatsApp quickly.",
    c2n: "Sita T., Itahari",
    c3: "Trusted company — quality matched what was listed on the site.",
    c3n: "Bikash M., Dharan",
    trusted: "Trusted source",
    trustedDesc: "Registered company with verified farm & supplier network.",
    quality: "Quality first",
    qualityDesc: "Clear specs and careful handling before listing.",
    support: "Real support",
    supportDesc: "Phone & WhatsApp help before and after your order.",
    growing: "Growing catalogue",
    growingDesc: "New local & international products added regularly.",
    go: "Open",
  },
  ne: {
    shop: "सामान किन्नुहोस्",
    contact: "सम्पर्क",
    about: "हाम्रो बारे",
    ownership: "स्वामित्व",
    home: "गृहपृष्ठ",
    products: "उत्पादन",
    gallery: "ग्यालरी",
    bulk: "थोक अर्डर",
    cart: "कार्ट",
    wishlist: "इच्छा सूची",
    orders: "मेरो अर्डर",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    admin: "एडमिन",
    search: "उत्पादन खोज्नुहोस्…",
    shopByCategory: "श्रेणी अनुसार",
    featured: "विशेष उत्पादन",
    why: "किन eKharayo",
    allProducts: "सबै उत्पादन",
    viewAll: "सबै हेर्नुहोस्",
    trackOnMap: "नक्सामा ट्र्याक",
    deliveryFrom: "मोरङ केन्द्रबाट डेलिभरी",
    outOfStock: "स्टक सकियो",
    inStock: "स्टकमा छ",
    addToCart: "कार्टमा राख्नुहोस्",
    buyNow: "अहिले किन्नुहोस्",
    heroBadge: "नेपालको कृषि बजार",
    heroTitle1: "गुणस्तरीय कृषि,",
    heroTitle2: "एक भरपर्दो प्लेटफर्म",
    heroSub:
      "Great Sagarmatha Trade Pvt. Ltd. को आधिकारिक डिजिटल बजार — नेपालभर डेलिभरी।",
    buyProductsDesc: "पूरा सूची हेर्नुहोस्",
    contactDesc: "फोन, WhatsApp र इमेल",
    ownershipDesc: "कम्पनी स्वामित्व",
    aboutDesc: "हाम्रो कथा र लक्ष्य",
    commentsTitle: "ग्राहकको प्रतिक्रिया",
    commentsSub: "नेपालभरिका खरीददारको अनुभव",
    c1: "ताजा सामान र उचित मूल्य। विराटनगर डेलिभरी समयमै आयो।",
    c1n: "रमेश के., विराटनगर",
    c2: "दुग्ध र पोल्ट्री अर्डर सजिलो। WhatsApp मा छिटो जवाफ आयो।",
    c2n: "सीता टी., इटहरी",
    c3: "भरपर्दो कम्पनी — साइटमा लेखे जस्तै गुणस्तर पाइयो।",
    c3n: "बिकास एम., धरान",
    trusted: "भरपर्दो स्रोत",
    trustedDesc: "दर्ता भएको कम्पनी, प्रमाणित फार्म र आपूर्तिकर्ता।",
    quality: "गुणस्तर पहिले",
    qualityDesc: "सूचीमा हाल्नु अघि स्पष्ट मापदण्ड र हेरचाह।",
    support: "वास्तविक सहयोग",
    supportDesc: "अर्डर अघि र पछि फोन तथा WhatsApp सहयोग।",
    growing: "बढ्दो सूची",
    growingDesc: "स्थानीय र अन्तर्राष्ट्रिय उत्पादन नियमित थपिन्छ।",
    go: "खोल्नुहोस्",
  },
} as const;

type DictKey = keyof typeof dict.en;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const LanguageContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict.en[k],
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return localStorage.getItem("ekharayo-lang") === "ne" ? "ne" : "en";
    } catch {
      return "en";
    }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("ekharayo-lang", l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === "ne" ? "ne" : "en";
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key: DictKey) => dict[lang][key] ?? dict.en[key],
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);
