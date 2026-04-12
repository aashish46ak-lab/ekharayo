import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Index;
