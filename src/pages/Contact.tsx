import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";

const Contact = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <PageShell title="Contact Us" subtitle="We'd love to hear from you — reach out anytime">
      <ContactFooter />
    </PageShell>
    <SiteFooter />
    <ScrollToTop />
  </div>
);

export default Contact;
