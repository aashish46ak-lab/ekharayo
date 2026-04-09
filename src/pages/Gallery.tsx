import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const Gallery = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <GallerySection />
    <ContactFooter />
    <ScrollToTop />
  </div>
);

export default Gallery;
