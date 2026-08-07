import { useLang } from "@/i18n/LanguageContext";

const LangSwitch = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-muted/80 p-0.5 ${
        compact ? "text-[10px]" : "text-xs"
      }`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded-full font-body font-semibold transition-colors ${
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ne")}
        className={`px-2 py-1 rounded-full font-body font-semibold transition-colors ${
          lang === "ne" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        नेपाली
      </button>
    </div>
  );
};

export default LangSwitch;
