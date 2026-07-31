export interface SearchItem {
  title: string;
  description: string;
  category: "product" | "page" | "category";
  href: string;
  keywords: string[]; // multilingual synonyms
}

export const searchItems: SearchItem[] = [
  // Products
  { title: "Fresh Cow Milk", description: "Pure farm-fresh cow milk", category: "product", href: "/products", keywords: ["milk", "dudh", "दूध", "gai ko dudh", "गाईको दूध", "cow milk", "fresh milk"] },
  { title: "Homemade Curd (Dahi)", description: "Thick, creamy curd", category: "product", href: "/products", keywords: ["curd", "dahi", "दही", "yogurt", "yoghurt"] },
  { title: "Pure Ghee", description: "Organic clarified butter", category: "product", href: "/products", keywords: ["ghee", "ghiu", "घ्यू", "घी", "butter", "clarified butter", "makhan"] },
  { title: "Goat Meat (Khasi ko Masu)", description: "Tender farm-raised goat meat", category: "product", href: "/products", keywords: ["goat", "khasi", "खसी", "mutton", "masu", "मासु", "meat", "boka", "बोका"] },
  { title: "Farm Chicken (Kukhura)", description: "Free-range chicken", category: "product", href: "/products", keywords: ["chicken", "kukhura", "कुखुरा", "poultry", "murga", "मुर्गा", "kukhra"] },
  { title: "Farm Eggs (Anda)", description: "Fresh organic eggs", category: "product", href: "/products", keywords: ["egg", "eggs", "anda", "अण्डा", "anda", "फूल अण्डा", "phul anda", "dim", "अंडा"] },
  { title: "Organic Rice (Chamal)", description: "Premium local rice", category: "product", href: "/products", keywords: ["rice", "chamal", "चामल", "bhat", "भात", "chawal"] },
  { title: "Wheat (Gahu)", description: "Freshly harvested wheat", category: "product", href: "/products", keywords: ["wheat", "gahu", "गहुँ", "atta", "flour", "आटा", "gehun"] },
  { title: "Seasonal Vegetables", description: "Daily-picked fresh vegetables", category: "product", href: "/products", keywords: ["vegetables", "tarkari", "तरकारी", "sabji", "सब्जी", "saag", "sabzi"] },

  // Categories
  { title: "Dairy Products", description: "Milk, curd, ghee & more", category: "category", href: "/products", keywords: ["dairy", "dudh", "दूध", "milk products"] },
  { title: "Goat Products", description: "Fresh goat meat", category: "category", href: "/products", keywords: ["goat", "khasi", "खसी", "bakhra", "बाख्रा"] },
  { title: "Chicken Products", description: "Chicken & eggs", category: "category", href: "/products", keywords: ["chicken", "kukhura", "कुखुरा", "poultry"] },
  { title: "Crop Products", description: "Rice, wheat & vegetables", category: "category", href: "/products", keywords: ["crops", "bali", "बाली", "grains", "अनाज"] },

  // Pages
  { title: "Home", description: "Back to homepage", category: "page", href: "/", keywords: ["home", "ghar", "घर", "main"] },
  { title: "All Products", description: "Browse all our products", category: "page", href: "/products", keywords: ["products", "shop", "buy", "order", "kinnu", "किन्नु"] },
  { title: "About Us", description: "Learn about eKharayo", category: "page", href: "/about", keywords: ["about", "baare", "बारेमा", "company", "who"] },
  { title: "Gallery", description: "Photo gallery of our farm", category: "page", href: "/gallery", keywords: ["gallery", "photos", "images", "tasbir", "तस्बिर"] },
  { title: "Ownership", description: "Company ownership details", category: "page", href: "/ownership", keywords: ["ownership", "owner", "malik", "मालिक"] },
  { title: "Bulk Order", description: "Place bulk orders", category: "page", href: "/bulk-order", keywords: ["bulk", "wholesale", "thok", "थोक", "order"] },
  { title: "Contact Us", description: "Get in touch with us", category: "page", href: "/contact", keywords: ["contact", "phone", "call", "sampark", "सम्पर्क", "email"] },
];

// Fuzzy match: check if query is a substring or close match
function fuzzyMatch(text: string, query: string): boolean {
  if (text.includes(query)) return true;
  // Simple edit-distance-like: allow 1 char difference for queries >= 3 chars
  if (query.length >= 3) {
    for (let i = 0; i <= text.length - query.length + 1; i++) {
      const sub = text.slice(i, i + query.length);
      let diff = 0;
      for (let j = 0; j < query.length; j++) {
        if (sub[j] !== query[j]) diff++;
      }
      if (diff <= 1) return true;
    }
  }
  return false;
}

export function searchQuery(query: string): { results: SearchItem[]; didYouMean: string | null } {
  const q = query.toLowerCase().trim();
  if (!q) return { results: [], didYouMean: null };

  const scored: { item: SearchItem; score: number }[] = [];

  for (const item of searchItems) {
    let bestScore = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();

    // Exact title match
    if (titleLower.includes(q)) bestScore = Math.max(bestScore, 100);
    // Title starts with
    if (titleLower.startsWith(q)) bestScore = Math.max(bestScore, 110);

    // Keyword exact match
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower === q) { bestScore = Math.max(bestScore, 95); break; }
      if (kwLower.includes(q)) { bestScore = Math.max(bestScore, 80); }
      if (q.includes(kwLower)) { bestScore = Math.max(bestScore, 70); }
    }

    // Description match
    if (descLower.includes(q)) bestScore = Math.max(bestScore, 50);

    // Fuzzy on keywords
    if (bestScore === 0) {
      for (const kw of item.keywords) {
        if (fuzzyMatch(kw.toLowerCase(), q)) { bestScore = Math.max(bestScore, 40); break; }
      }
    }
    // Fuzzy on title
    if (bestScore === 0 && fuzzyMatch(titleLower, q)) bestScore = 30;

    if (bestScore > 0) scored.push({ item, score: bestScore });
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.map((s) => s.item);

  // Did you mean: if no results, find closest keyword
  let didYouMean: string | null = null;
  if (results.length === 0 && q.length >= 2) {
    let bestDist = Infinity;
    for (const item of searchItems) {
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        // Simple distance: length diff + char diff
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

  return { results: results.slice(0, 8), didYouMean };
}
