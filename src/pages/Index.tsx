import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomeExtras from "@/components/HomeExtras";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HomeExtras />
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Index;
