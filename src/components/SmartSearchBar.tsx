import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBasket, FileText, FolderOpen, ArrowRight } from "lucide-react";
import { searchQuery, SearchItem } from "@/lib/searchData";

const categoryIcons = {
  product: ShoppingBasket,
  page: FileText,
  category: FolderOpen,
};

const categoryLabels = {
  product: "Product",
  page: "Page",
  category: "Category",
};

interface SmartSearchBarProps {
  variant?: "hero" | "navbar";
}

const SmartSearchBar = ({ variant = "hero" }: SmartSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const doSearch = useCallback((q: string) => {
    const { results: r, didYouMean: d } = searchQuery(q);
    setResults(r);
    setDidYouMean(d);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    doSearch(query);
  }, [query, doSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (href: string) => {
    setQuery("");
    setFocused(false);
    navigate(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        goTo(results[activeIndex].href);
      } else if (results.length > 0) {
        goTo(results[0].href);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-bold">{text.slice(idx, idx + query.trim().length)}</span>
        {text.slice(idx + query.trim().length)}
      </>
    );
  };

  const showDropdown = focused && query.trim().length > 0;

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={`relative w-full ${isHero ? "max-w-xl mx-auto" : "max-w-xs"}`}>
      {/* Input */}
      <div
        className={`flex items-center gap-2 rounded-xl border transition-all duration-300 ${
          isHero
            ? `px-4 py-3 ${focused ? "border-primary/50 shadow-lg shadow-primary/10" : "border-white/15"}`
            : `px-3 py-2 ${focused ? "border-primary/50" : "border-border"}`
        }`}
        style={{
          background: isHero ? "rgba(255,255,255,0.08)" : "hsl(var(--card))",
          backdropFilter: isHero ? "blur(16px)" : undefined,
        }}
      >
        <Search className={`shrink-0 ${isHero ? "text-primary" : "text-muted-foreground"}`} size={isHero ? 20 : 16} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, pages… (English, नेपाली, हिन्दी)"
          className={`w-full bg-transparent outline-none font-body ${
            isHero
              ? "text-white placeholder:text-white/40 text-sm"
              : "text-foreground placeholder:text-muted-foreground text-xs"
          }`}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="text-white/40 hover:text-white/70 text-xs font-body shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border overflow-hidden z-50 animate-fade-in shadow-2xl"
          style={{ background: "hsl(var(--card) / 0.97)", backdropFilter: "blur(20px)" }}
        >
          {results.length > 0 ? (
            <ul className="py-1.5 max-h-72 overflow-y-auto">
              {results.map((item, i) => {
                const Icon = categoryIcons[item.category];
                return (
                  <li key={`${item.title}-${item.href}-${i}`}>
                    <button
                      onClick={() => goTo(item.href)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${
                        i === activeIndex ? "bg-primary/10" : "hover:bg-primary/5"
                      }`}
                    >
                      <Icon size={16} className="text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-foreground truncate">{highlightMatch(item.title)}</p>
                        <p className="font-body text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                      <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider shrink-0 border border-border rounded px-1.5 py-0.5">
                        {categoryLabels[item.category]}
                      </span>
                      <ArrowRight size={12} className="text-muted-foreground shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="font-body text-sm text-muted-foreground">No results found for "<span className="text-foreground">{query}</span>"</p>
              {didYouMean && (
                <button
                  onClick={() => setQuery(didYouMean)}
                  className="mt-2 font-body text-sm text-primary hover:underline"
                >
                  Did you mean: <span className="font-semibold">{didYouMean}</span>?
                </button>
              )}
              <p className="mt-3 font-body text-xs text-muted-foreground">Try searching for "milk", "egg", "अण्डा", or "chicken"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
