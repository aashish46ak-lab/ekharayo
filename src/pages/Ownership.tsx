import Navbar from "@/components/Navbar";
import OwnershipSection from "@/components/OwnershipSection";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const Ownership = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <OwnershipSection />
    <ContactFooter />
    <ScrollToTop />
  </div>
);

export default Ownership;
