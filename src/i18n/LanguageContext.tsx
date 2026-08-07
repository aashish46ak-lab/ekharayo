import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "en" | "ne";

const dict = {
  en: {
    shop: "Buy Products",
    contact: "Contact Us",
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
    deliveryFrom: "Delivery from Itahari HQ",
    outOfStock: "Out of stock",
    inStock: "In stock",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    heroBadge: "Nepal's Agricultural Marketplace",
    heroTitle1: "Quality Agriculture,",
    heroTitle2: "One Trusted Platform",
    heroSub:
      "Official marketplace of Great Sagarmatha Trade Pvt. Ltd. — based in Itahari-20, Sunsari. Farm products delivered across Nepal.",
    buyProductsDesc: "Browse full catalogue",
    contactDesc: "Phone, WhatsApp & email",
    ownershipDesc: "Company ownership",
    aboutDesc: "Our story & mission",
    galleryDesc: "Photos from our work",
    commentsTitle: "What customers say",
    commentsSub: "Real feedback from buyers across Nepal",
    c1: "Fresh products and honest pricing. Delivery reached on time.",
    c1n: "Ramesh K., Biratnagar",
    c2: "Easy to order dairy and poultry. Support answered quickly.",
    c2n: "Sita T., Itahari",
    c3: "Trusted company — quality matched what was listed on the site.",
    c3n: "Bikash M., Dharan",
    trusted: "Trusted source",
    trustedDesc: "Registered company with verified farm & supplier network.",
    quality: "Quality first",
    qualityDesc: "Clear specs and careful handling before listing.",
    support: "Real support",
    supportDesc: "Phone & chat help before and after your order.",
    growing: "Growing catalogue",
    growingDesc: "New local & international products added regularly.",
    go: "Open",
    detailTitle: "From Itahari to your door",
    detailBody:
      "Our base is Itahari-20, Sunsari. Delivery fee is calculated by distance from this HQ (max Rs. 350). Orders above Rs. 3,000 may qualify for free delivery.",
    detailPoint1: "Distance-based delivery from Itahari-20, Sunsari",
    detailPoint2: "COD available · digital wallets coming soon",
    detailPoint3: "Live message chat with our team",
    detailPoint4: "Secure checkout and order tracking",
    ownTitle: "Ownership",
    ownSub: "Who owns and runs Great Sagarmatha Trade Pvt. Ltd.",
    ownIntro:
      "eKharayo is the official digital marketplace of Great Sagarmatha Trade Pvt. Ltd., based in Itahari-20, Sunsari.",
    ownCompany: "Company",
    ownCompanyBody:
      "Great Sagarmatha Trade Pvt. Ltd. operates eKharayo to sell farm-fresh and supplier-sourced goods with clear pricing and accountable delivery from Itahari.",
    ownFounder: "Leadership",
    ownFounderBody:
      "The company is managed by its registered leadership team. For formal ownership details, use Contact Us.",
    aboutTitle: "About eKharayo",
    aboutSub: "Official digital marketplace of Great Sagarmatha Trade Pvt. Ltd.",
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
    deliveryFrom: "इटहरी केन्द्रबाट डेलिभरी",
    outOfStock: "स्टक सकियो",
    inStock: "स्टकमा छ",
    addToCart: "कार्टमा राख्नुहोस्",
    buyNow: "अहिले किन्नुहोस्",
    heroBadge: "नेपालको कृषि बजार",
    heroTitle1: "गुणस्तरीय कृषि,",
    heroTitle2: "एक भरपर्दो प्लेटफर्म",
    heroSub:
      "Great Sagarmatha Trade Pvt. Ltd. को आधिकारिक डिजिटल बजार — इटहरी-२०, सुनसरी। नेपालभर डेलिभरी।",
    buyProductsDesc: "पूरा सूची हेर्नुहोस्",
    contactDesc: "फोन, WhatsApp र इमेल",
    ownershipDesc: "कम्पनी स्वामित्व",
    aboutDesc: "हाम्रो कथा र लक्ष्य",
    galleryDesc: "हाम्रो कामका तस्बिर",
    commentsTitle: "ग्राहकको प्रतिक्रिया",
    commentsSub: "नेपालभरिका खरीददारको अनुभव",
    c1: "ताजा सामान र उचित मूल्य। डेलिभरी समयमै आयो।",
    c1n: "रमेश के., विराटनगर",
    c2: "दुग्ध र पोल्ट्री अर्डर सजिलो। छिटो जवाफ आयो।",
    c2n: "सीता टी., इटहरी",
    c3: "भरपर्दो कम्पनी — साइटमा लेखे जस्तै गुणस्तर।",
    c3n: "बिकास एम., धरान",
    trusted: "भरपर्दो स्रोत",
    trustedDesc: "दर्ता भएको कम्पनी, प्रमाणित फार्म र आपूर्तिकर्ता।",
    quality: "गुणस्तर पहिले",
    qualityDesc: "सूचीमा हाल्नु अघि स्पष्ट मापदण्ड र हेरचाह।",
    support: "वास्तविक सहयोग",
    supportDesc: "अर्डर अघि र पछि फोन तथा च्याट सहयोग।",
    growing: "बढ्दो सूची",
    growingDesc: "स्थानीय र अन्तर्राष्ट्रिय उत्पादन नियमित थपिन्छ।",
    go: "खोल्नुहोस्",
    detailTitle: "इटहरीबाट तपाईंको घरसम्म",
    detailBody:
      "हाम्रो आधार इटहरी-२०, सुनसरी हो। डेलिभरी शुल्क यस HQ बाट दूरी अनुसार (अधिकतम रु. ३५०)। रु. ३,००० भन्दा माथि निःशुल्क डेलिभरी हुन सक्छ।",
    detailPoint1: "इटहरी-२०, सुनसरीबाट दूरी अनुसार डेलिभरी",
    detailPoint2: "COD उपलब्ध · डिजिटल वालेट चाँडै",
    detailPoint3: "टोलीसँग लाइभ सन्देश च्याट",
    detailPoint4: "सुरक्षित चेकआउट र अर्डर ट्र्याकिङ",
    ownTitle: "स्वामित्व",
    ownSub: "Great Sagarmatha Trade Pvt. Ltd. को स्वामित्व र सञ्चालन",
    ownIntro:
      "eKharayo Great Sagarmatha Trade Pvt. Ltd. को आधिकारिक डिजिटल बजार हो — इटहरी-२०, सुनसरी।",
    ownCompany: "कम्पनी",
    ownCompanyBody:
      "Great Sagarmatha Trade Pvt. Ltd. ले eKharayo मार्फत इटहरीबाट स्पष्ट मूल्य र जवाफदेही डेलिभरीसहित कृषि सामान बेच्छ।",
    ownFounder: "नेतृत्व",
    ownFounderBody:
      "कम्पनी दर्ता भएको नेतृत्व टोलीद्वारा सञ्चालित छ। विवरणका लागि Contact Us प्रयोग गर्नुहोस्।",
    aboutTitle: "eKharayo बारे",
    aboutSub: "Great Sagarmatha Trade Pvt. Ltd. को आधिकारिक डिजिटल बजार",
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
