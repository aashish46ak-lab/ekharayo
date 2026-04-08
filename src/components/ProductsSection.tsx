import dairyImg from "@/assets/dairy.jpg";
import goatImg from "@/assets/goat.jpg";
import chickenImg from "@/assets/chicken.jpg";
import cropsImg from "@/assets/crops.jpg";

interface Product {
  name: string;
  description: string;
  price: string;
}

interface Category {
  title: string;
  image: string;
  products: Product[];
}

const categories: Category[] = [
  {
    title: "🥛 Dairy Products",
    image: dairyImg,
    products: [
      { name: "Fresh Cow Milk", description: "Pure farm-fresh cow milk, delivered daily.", price: "Rs 80/L" },
      { name: "Homemade Curd (Dahi)", description: "Thick, creamy curd made the traditional way.", price: "Rs 100/L" },
      { name: "Pure Ghee", description: "Organic clarified butter for rich flavor.", price: "Rs 1,800/kg" },
    ],
  },
  {
    title: "🐐 Goat Products",
    image: goatImg,
    products: [
      { name: "Fresh Goat Meat (Khasi ko Masu)", description: "Tender, farm-raised goat meat.", price: "Rs 1,200/kg" },
      { name: "Goat Milk", description: "Nutritious and creamy goat milk.", price: "Rs 120/L" },
    ],
  },
  {
    title: "🍗 Chicken Products",
    image: chickenImg,
    products: [
      { name: "Farm Chicken (Kukhura)", description: "Free-range, antibiotic-free chicken.", price: "Rs 450/kg" },
      { name: "Farm Eggs (Anda)", description: "Fresh organic eggs from happy hens.", price: "Rs 18/pc" },
    ],
  },
  {
    title: "🌾 Crop Products",
    image: cropsImg,
    products: [
      { name: "Organic Rice (Chamal)", description: "Premium local rice varieties.", price: "Rs 120/kg" },
      { name: "Wheat (Gahu)", description: "Freshly harvested whole wheat.", price: "Rs 70/kg" },
      { name: "Seasonal Vegetables", description: "Daily-picked fresh vegetables.", price: "Rs 60-150/kg" },
    ],
  },
];

const ProductsSection = () => {
  const orderUrl = (name: string) =>
    `https://wa.me/9779852049458?text=${encodeURIComponent(`Hi! I'd like to order: ${name}`)}`;

  return (
    <section id="products" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-body text-accent text-sm uppercase tracking-[0.2em] font-semibold mb-2">Our Products</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Farm-Fresh Goodness</h2>
        </div>

        <div className="space-y-20">
          {categories.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-4 mb-8">
                <img src={cat.image} alt={cat.title} loading="lazy" width={640} height={512} className="w-16 h-16 rounded-lg object-cover shadow-md" />
                <h3 className="font-display text-2xl font-bold text-foreground">{cat.title}</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cat.products.map((p) => (
                  <div key={p.name} className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-lg transition-shadow group">
                    <h4 className="font-display text-lg font-bold text-foreground mb-1">{p.name}</h4>
                    <p className="font-body text-sm text-muted-foreground mb-4">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-lg font-bold text-primary">{p.price}</span>
                      <a
                        href={orderUrl(p.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-body text-sm font-semibold px-5 py-2 rounded-md hover:bg-green-glow transition-colors"
                      >
                        Order Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
