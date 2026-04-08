import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import AboutSection from "@/components/AboutSection";
import GallerySection from "@/components/GallerySection";
import OwnershipSection from "@/components/OwnershipSection";
import BulkOrderSection from "@/components/BulkOrderSection";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProductsSection />
      <AboutSection />
      <GallerySection />
      <OwnershipSection />
      <BulkOrderSection />
      <ContactFooter />
      <ScrollToTop />
    </div>
  );
};

export default Index;
