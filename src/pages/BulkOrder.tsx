import Navbar from "@/components/Navbar";
import BulkOrderSection from "@/components/BulkOrderSection";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const BulkOrder = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <BulkOrderSection />
    <ContactFooter />
    <ScrollToTop />
  </div>
);

export default BulkOrder;
