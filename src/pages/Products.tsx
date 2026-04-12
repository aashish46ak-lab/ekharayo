import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import dairyImg from "@/assets/dairy.jpg";
import goatImg from "@/assets/goat.jpg";
import chickenImg from "@/assets/chicken.jpg";
import cropsImg from "@/assets/crops.jpg";

interface Product { name: string; description: string; }
interface Category { title: string; image: string; products: Product[]; }

const categories: Category[] = [
  { title: "🥛 Dairy Products", image: dairyImg, products: [
    { name: "Fresh Cow Milk", description: "Pure farm-fresh cow milk, delivered daily." },
    { name: "Homemade Curd (Dahi)", description: "Thick, creamy curd made the traditional way." },
    { name: "Pure Ghee", description: "Organic clarified butter for rich flavor." },
  ]},
  { title: "🐐 Goat Products", image: goatImg, products: [
    { name: "Fresh Goat Meat (Khasi ko Masu)", description: "Tender, farm-raised goat meat." },
  ]},
  { title: "🍗 Chicken Products", image: chickenImg, products: [
    { name: "Farm Chicken (Kukhura)", description: "Free-range, antibiotic-free chicken." },
    { name: "Farm Eggs (Anda)", description: "Fresh organic eggs from happy hens." },
  ]},
  { title: "🌾 Crop Products", image: cropsImg, products: [
    { name: "Organic Rice (Chamal)", description: "Premium local rice varieties." },
    { name: "Wheat (Gahu)", description: "Freshly harvested whole wheat." },
    { name: "Seasonal Vegetables", description: "Daily-picked fresh vegetables." },
  ]},
];

const Products = () => {
  const orderUrl = (name: string) =>
    `https://wa.me/9779852049458?text=${encodeURIComponent(`Hi! I'd like to order: ${name}`)}`;

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title="Our Products" subtitle="Farm-fresh dairy, meat, and crops delivered to your doorstep">
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-16">
            {categories.map((cat) => (
              <div key={cat.title}>
                <div className="flex items-center gap-4 mb-8">
                  <img src={cat.image} alt={cat.title} loading="lazy" className="w-16 h-16 rounded-xl object-cover shadow-md ring-2 ring-primary/30" />
                  <h3 className="font-display text-2xl font-bold text-foreground">{cat.title}</h3>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.products.map((p) => (
                    <div key={p.name} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
                      <h4 className="font-display text-lg font-bold text-foreground mb-1">{p.name}</h4>
                      <p className="font-body text-sm text-muted-foreground mb-4">{p.description}</p>
                      <a href={orderUrl(p.name)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-2 rounded-md hover:bg-green-glow transition-colors">
                        Order Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Products;
