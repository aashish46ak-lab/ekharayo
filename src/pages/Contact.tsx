import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const Contact = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <PageShell title="Contact Us" subtitle="We'd love to hear from you — reach out anytime" bgClass="bg-background">
      <ContactFooter />
    </PageShell>
    <ScrollToTop />
  </div>
);

export default Contact;
