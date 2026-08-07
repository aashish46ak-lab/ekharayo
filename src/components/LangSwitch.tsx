import { useLang } from "@/i18n/LanguageContext";

/** Compact EN | नेपाली toggle — designed to sit under logo */
const LangSwitch = () => {
  const { lang, setLang } = useLang();

  return (
    <div
      className="inline-flex items-center rounded-md border border-border/80 bg-muted/60 p-0.5 text-[10px] leading-none"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-1.5 py-0.5 rounded font-body font-semibold transition-colors ${
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ne")}
        className={`px-1.5 py-0.5 rounded font-body font-semibold transition-colors ${
          lang === "ne" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        नेप
      </button>
    </div>
  );
};

export default LangSwitch;
