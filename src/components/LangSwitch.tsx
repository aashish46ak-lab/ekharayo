import { useLang } from "@/i18n/LanguageContext";

/** Inline compact switch (mobile menu etc.) */
const LangSwitch = () => {
  const { lang, setLang } = useLang();

  return (
    <div className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 p-0.5 text-[10px]" role="group" aria-label="Language">
      <button type="button" onClick={() => setLang("en")} className={`px-2 py-0.5 rounded-full font-body font-semibold ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</button>
      <button type="button" onClick={() => setLang("ne")} className={`px-2 py-0.5 rounded-full font-body font-semibold ${lang === "ne" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>नेप</button>
    </div>
  );
};

export default LangSwitch;
