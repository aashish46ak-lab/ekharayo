import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBasket, FileText, FolderOpen, ArrowRight } from "lucide-react";
import { searchQuery, SearchItem, searchItems } from "@/lib/searchData";
import { supabase } from "@/integrations/supabase/client";

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
  const [liveItems, setLiveItems] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load real products + categories from Supabase so search shows actual store items
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [pRes, cRes] = await Promise.all([
        supabase.from("products").select("id,name,description").eq("is_active", true).limit(100),
        supabase.from("categories").select("id,name,slug").order("sort_order").limit(50),
      ]);
      if (cancelled) return;

      const fromProducts: SearchItem[] = ((pRes.data as { id: string; name: string; description: string | null }[]) ?? []).map(
        (p) => ({
          title: p.name,
          description: p.description || "Available in our store",
          category: "product" as const,
          href: "/products",
          keywords: [p.name.toLowerCase(), ...(p.description ? p.description.toLowerCase().split(/\s+/).slice(0, 6) : [])],
        }),
      );

      const fromCategories: SearchItem[] = ((cRes.data as { id: string; name: string; slug: string }[]) ?? []).map((c) => ({
        title: c.name,
        description: `Browse ${c.name}`,
        category: "category" as const,
        href: "/products",
        keywords: [c.name.toLowerCase(), c.slug.toLowerCase()],
      }));

      setLiveItems([...fromProducts, ...fromCategories]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const doSearch = useCallback(
    (q: string) => {
      // Merge static searchData + live Supabase items (live first so real products rank higher)
      const combined = [...liveItems, ...searchItems];
      // Deduplicate by title+href
      const seen = new Set<string>();
      const unique: SearchItem[] = [];
      for (const item of combined) {
        const key = `${item.title.toLowerCase()}|${item.href}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(item);
      }

      // Temporary override: search against merged list
      const { results: r, didYouMean: d } = searchAgainst(unique, q);
      setResults(r);
      setDidYouMean(d);
      setActiveIndex(-1);
    },
    [liveItems],
  );

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
      } else if (query.trim()) {
        goTo(`/products`);
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
  // Also show popular items when focused with empty query (so user sees what exists)
  const showSuggestions = focused && query.trim().length === 0 && liveItems.length > 0;
  const suggestionList = liveItems.filter((i) => i.category === "product").slice(0, 6);

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
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={`text-xs font-body shrink-0 ${isHero ? "text-white/40 hover:text-white/70" : "text-muted-foreground hover:text-foreground"}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown — search results */}
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
                      type="button"
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
              <p className="font-body text-sm text-muted-foreground">
                No results found for "<span className="text-foreground">{query}</span>"
              </p>
              {didYouMean && (
                <button type="button" onClick={() => setQuery(didYouMean)} className="mt-2 font-body text-sm text-primary hover:underline">
                  Did you mean: <span className="font-semibold">{didYouMean}</span>?
                </button>
              )}
              <p className="mt-3 font-body text-xs text-muted-foreground">Try searching for "milk", "egg", "अण्डा", or "chicken"</p>
            </div>
          )}
        </div>
      )}

      {/* Suggestions when focused with empty query — show existing products */}
      {showSuggestions && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border overflow-hidden z-50 animate-fade-in shadow-2xl"
          style={{ background: "hsl(var(--card) / 0.97)", backdropFilter: "blur(20px)" }}
        >
          <p className="px-4 pt-3 pb-1 font-body text-[10px] uppercase tracking-wider text-muted-foreground">Popular products</p>
          <ul className="py-1.5 max-h-72 overflow-y-auto">
            {suggestionList.map((item, i) => {
              const Icon = categoryIcons[item.category];
              return (
                <li key={`sug-${item.title}-${i}`}>
                  <button
                    type="button"
                    onClick={() => goTo(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-primary/5"
                  >
                    <Icon size={16} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-foreground truncate">{item.title}</p>
                      <p className="font-body text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <ArrowRight size={12} className="text-muted-foreground shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

/** Local search against a custom item list (same scoring as searchData). */
function searchAgainst(items: SearchItem[], query: string): { results: SearchItem[]; didYouMean: string | null } {
  const q = query.toLowerCase().trim();
  if (!q) return { results: [], didYouMean: null };

  const scored: { item: SearchItem; score: number }[] = [];

  for (const item of items) {
    let bestScore = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();

    if (titleLower.includes(q)) bestScore = Math.max(bestScore, 100);
    if (titleLower.startsWith(q)) bestScore = Math.max(bestScore, 110);

    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower === q) {
        bestScore = Math.max(bestScore, 95);
        break;
      }
      if (kwLower.includes(q)) bestScore = Math.max(bestScore, 80);
      if (q.includes(kwLower) && kwLower.length >= 2) bestScore = Math.max(bestScore, 70);
    }

    if (descLower.includes(q)) bestScore = Math.max(bestScore, 50);

    if (bestScore > 0) scored.push({ item, score: bestScore });
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.map((s) => s.item).slice(0, 8);

  let didYouMean: string | null = null;
  if (results.length === 0 && q.length >= 2) {
    let bestDist = Infinity;
    for (const item of items) {
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        if (Math.abs(kwLower.length - q.length) <= 2) {
          let diff = 0;
          const len = Math.min(kwLower.length, q.length);
          for (let i = 0; i < len; i++) {
            if (kwLower[i] !== q[i]) diff++;
          }
          diff += Math.abs(kwLower.length - q.length);
          if (diff < bestDist && diff <= 3) {
            bestDist = diff;
            didYouMean = kw;
          }
        }
      }
    }
  }

  return { results, didYouMean };
}

export default SmartSearchBar;
