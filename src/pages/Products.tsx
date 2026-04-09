import Navbar from "@/components/Navbar";
import ProductsSection from "@/components/ProductsSection";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const Products = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <ProductsSection />
    <ContactFooter />
    <ScrollToTop />
  </div>
);

export default Products;
