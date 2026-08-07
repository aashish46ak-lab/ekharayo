import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultDict, type DictKey, type Lang } from "@/i18n/defaults";

type Overrides = Partial<Record<Lang, Partial<Record<DictKey, string>>>>;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
  /** Reload admin copy from DB */
  refreshCopy: () => Promise<void>;
}

const LanguageContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => defaultDict.en[k],
  refreshCopy: async () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return localStorage.getItem("ekharayo-lang") === "ne" ? "ne" : "en";
    } catch {
      return "en";
    }
  });
  const [overrides, setOverrides] = useState<Overrides>({});

  const refreshCopy = async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "copy").maybeSingle();
    const v = (data?.value as Overrides | null) ?? {};
    setOverrides(v);
  };

  useEffect(() => {
    refreshCopy();
  }, []);

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
      refreshCopy,
      t: (key: DictKey) => {
        const fromAdmin = overrides[lang]?.[key];
        if (fromAdmin && String(fromAdmin).trim()) return String(fromAdmin);
        return defaultDict[lang][key] ?? defaultDict.en[key] ?? key;
      },
    }),
    [lang, overrides],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);
export type { DictKey, Lang };
