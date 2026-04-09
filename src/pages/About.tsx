import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const About = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <AboutSection />
    <ContactFooter />
    <ScrollToTop />
  </div>
);

export default About;
