import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import GallerySection from "@/components/GallerySection";

const Gallery = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <PageShell title="Gallery" subtitle="A glimpse into our farms and daily operations">
      <GallerySection />
    </PageShell>
    <SiteFooter />
    <ScrollToTop />
  </div>
);

export default Gallery;
