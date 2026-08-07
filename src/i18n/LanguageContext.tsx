import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "en" | "ne";

const dict = {
  en: {
    shop: "Shop products",
    contact: "Contact us",
    home: "Home",
    products: "Products",
    about: "About",
    gallery: "Gallery",
    ownership: "Ownership",
    bulk: "Bulk Order",
    cart: "Cart",
    wishlist: "Wishlist",
    orders: "My Orders",
    signIn: "Sign in",
    signOut: "Sign out",
    admin: "Admin",
    search: "Search…",
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
  },
  ne: {
    shop: "सामान किन्नुहोस्",
    contact: "सम्पर्क",
    home: "गृह",
    products: "उत्पादन",
    about: "हाम्रो बारे",
    gallery: "ग्यालरी",
    ownership: "स्वामित्व",
    bulk: "थोक अर्डर",
    cart: "कार्ट",
    wishlist: "इच्छा सूची",
    orders: "मेरो अर्डर",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    admin: "एडमिन",
    search: "खोज्नुहोस्…",
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
      const v = localStorage.getItem("ekharayo-lang");
      return v === "ne" ? "ne" : "en";
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
