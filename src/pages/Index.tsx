import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import AboutSection from "@/components/AboutSection";
import OwnershipSection from "@/components/OwnershipSection";
import BulkOrderSection from "@/components/BulkOrderSection";
import ContactFooter from "@/components/ContactFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProductsSection />
      <AboutSection />
      <OwnershipSection />
      <BulkOrderSection />
      <ContactFooter />
    </div>
  );
};

export default Index;
