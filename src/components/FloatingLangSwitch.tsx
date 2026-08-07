import { useLang } from "@/i18n/LanguageContext";

/**
 * Fixed top-left "dynamic island" language pill — stays put while scrolling.
 * Sits just under the navbar.
 */
const FloatingLangSwitch = () => {
  const { lang, setLang } = useLang();

  return (
    <div
      className="fixed top-[58px] left-3 sm:left-4 z-[55] pointer-events-auto"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div
        className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-[#0c121c]/90 px-1 py-1 shadow-lg shadow-black/40 backdrop-blur-xl"
        role="group"
        aria-label="Language"
      >
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`min-w-[2.25rem] rounded-full px-2.5 py-1 font-body text-[11px] font-bold tracking-wide transition-all ${
            lang === "en"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-white/55 hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang("ne")}
          className={`min-w-[2.25rem] rounded-full px-2.5 py-1 font-body text-[11px] font-bold tracking-wide transition-all ${
            lang === "ne"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-white/55 hover:text-white"
          }`}
        >
          नेप
        </button>
      </div>
    </div>
  );
};

export default FloatingLangSwitch;
