import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";
import {
  Sprout, ShieldCheck, Globe2, Handshake, MapPin, Factory, Tractor, UserCircle,
  Target, Eye, PackageSearch, Wheat, Leaf, Wrench, Beef, Boxes, Store, Building2,
  Users, BadgeCheck, Tag, Headset, Lock, Sparkles, HeartHandshake,
} from "lucide-react";

const values = [
  { icon: Sprout, title: "Agriculture Meets Technology", desc: "We combine modern digital commerce with practical agricultural expertise so quality products reach customers faster and with less friction." },
  { icon: ShieldCheck, title: "Quality & Transparency", desc: "Every product listed on eKharayo is sourced through verified channels, with clear information on origin, specification and handling." },
  { icon: Globe2, title: "Local & International Reach", desc: "Alongside our own production, we curate goods from trusted Nepali businesses and selected international suppliers." },
  { icon: Handshake, title: "Long-Term Partnerships", desc: "We build lasting relationships with farmers, suppliers, wholesalers and distributors — growth that benefits every partner." },
];

const services = [
  { icon: Wheat, title: "Agricultural Products", desc: "Staple crops, grains, dairy and farm produce from our own farms and vetted growers." },
  { icon: Sprout, title: "Seeds & Farming Supplies", desc: "Quality seeds, fertilisers and everyday inputs for productive, healthy fields." },
  { icon: Leaf, title: "Organic Products", desc: "Chemical-free produce and organic ranges for health-conscious households." },
  { icon: Wrench, title: "Farming Equipment", desc: "Tools, machinery and accessories that make modern farming efficient." },
  { icon: Beef, title: "Livestock-Related Products", desc: "Feed, husbandry supplies and livestock products handled to strict standards." },
  { icon: Boxes, title: "Wholesale Supply", desc: "Bulk volumes with dependable lead times for businesses and institutions." },
  { icon: Store, title: "Retail Supply", desc: "Household-sized packs delivered to doorsteps across Nepal." },
  { icon: Building2, title: "B2B Solutions", desc: "Contract supply, recurring orders and negotiated pricing for business buyers." },
  { icon: Users, title: "B2C Marketplace", desc: "A simple, secure shopping experience for everyday customers." },
  { icon: PackageSearch, title: "Trusted Supplier Marketplace", desc: "A growing catalogue from suppliers, manufacturers, wholesalers, importers and distributors." },
  { icon: MapPin, title: "Sourced in Nepal", desc: "Priority given to Nepali producers, strengthening local agricultural commerce." },
  { icon: Globe2, title: "Selected International Products", desc: "Carefully chosen imports that fill gaps in the local market." },
];

const whyUs = [
  { icon: BadgeCheck, title: "Trusted Marketplace", desc: "A registered company behind every order, with accountability at each step." },
  { icon: ShieldCheck, title: "Quality Assurance", desc: "Products are inspected and specified before they reach our catalogue." },
  { icon: PackageSearch, title: "Carefully Selected Suppliers", desc: "We onboard partners only after verifying capability and consistency." },
  { icon: Tag, title: "Competitive Pricing", desc: "Direct sourcing and scale keep prices fair for households and businesses." },
  { icon: Headset, title: "Reliable Customer Support", desc: "Real people on phone, email and WhatsApp — before and after purchase." },
  { icon: Lock, title: "Secure Shopping Experience", desc: "Straightforward ordering with safeguarded customer information." },
  { icon: Globe2, title: "Local & Global Range", desc: "One platform for Nepali produce and selected international products." },
  { icon: Sparkles, title: "Continuous Innovation", desc: "The platform keeps improving — new categories, partners and features." },
  { icon: HeartHandshake, title: "Customer Satisfaction First", desc: "Your repeat trust is the measure we hold ourselves to." },
];

const About = () => (
  <div className="min-h-screen pt-14">
    <Navbar />
    <PageShell
      title="About eKharayo"
      subtitle="The official digital marketplace of Great Sagarmatha Traders PVT LTD"
    >
      <div className="container mx-auto px-4 py-16 space-y-20">

        {/* Company overview */}
        <section className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Company Overview</h2>
          <p className="font-body text-base text-foreground/80 leading-relaxed">
            <strong className="text-primary">eKharayo</strong> is the official digital marketplace of{" "}
            <strong className="text-foreground">Great Sagarmatha Traders PVT LTD</strong>, built to connect customers
            with dependable agricultural products from Nepal and around the world through one modern platform.
          </p>
          <p className="font-body text-base text-foreground/80 leading-relaxed">
            Customers can buy products offered directly by Great Sagarmatha Traders PVT LTD — grown, raised and
            processed at our own farms and mills — and also access a carefully curated selection sourced from trusted
            suppliers, manufacturers, wholesalers, importers and distributors in Nepali and international markets.
          </p>
          <p className="font-body text-base text-foreground/80 leading-relaxed">
            eKharayo is not only an online store. It is a growing marketplace designed to give customers a wide,
            reliable choice of agricultural products, with new categories and verified business partners added
            continuously.
          </p>
        </section>

        {/* About us / values */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">About Us</h2>
            <p className="font-body text-muted-foreground mt-2 max-w-2xl mx-auto">
              Great Sagarmatha Traders PVT LTD believes agriculture and modern technology belong together — that is how
              quality products become genuinely accessible.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-8 text-center shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon className="text-primary" size={28} />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg shadow-primary/5">
            <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center mb-4">
              <Target className="text-primary" size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-3">Our Mission</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              To provide customers with reliable agricultural products they can order with confidence, to advance
              modern agricultural commerce in Nepal, to create real opportunities for farmers and business partners,
              and to make quality products easily accessible through digital technology.
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg shadow-primary/5">
            <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center mb-4">
              <Eye className="text-primary" size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-3">Our Vision</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              To become one of Nepal's leading agricultural marketplace platforms — connecting local businesses with
              national and international markets, and earning long-term trust from every customer we serve.
            </p>
          </div>
        </section>

        {/* Services */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Our Services</h2>
            <p className="font-body text-muted-foreground mt-2">What you can source through eKharayo today</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <Icon className="text-primary mb-3" size={26} />
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="font-body text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
            Our catalogue keeps growing — new products and trusted business partners are added to the platform on an
            ongoing basis.
          </p>
        </section>

        {/* Why choose */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Why Choose eKharayo</h2>
            <p className="font-body text-muted-foreground mt-2">Nine reasons customers and businesses keep coming back</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {whyUs.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <Icon className="text-primary mb-3" size={26} />
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Facilities & location */}
        <section className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-6 text-center shadow-sm">
            <Tractor className="text-primary mx-auto mb-3" size={30} />
            <h4 className="font-display text-lg font-bold text-foreground mb-1">Our Farms</h4>
            <p className="font-body text-sm text-muted-foreground">Cattle, poultry and crop farms run on sustainable practices.</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center shadow-sm">
            <Factory className="text-primary mx-auto mb-3" size={30} />
            <h4 className="font-display text-lg font-bold text-foreground mb-1">Our Mills</h4>
            <p className="font-body text-sm text-muted-foreground">Modern processing mills for rice, wheat and other grains.</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center shadow-sm">
            <MapPin className="text-primary mx-auto mb-3" size={30} />
            <h4 className="font-display text-lg font-bold text-foreground mb-1">Head Office</h4>
            <p className="font-body text-sm text-muted-foreground">Patharishanishchare-5, Morang, Nepal.</p>
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/ownership"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-4 rounded-lg hover:bg-green-glow transition-all text-base hover:-translate-y-0.5"
          >
            <UserCircle size={20} /> View Ownership
          </Link>
        </div>

      </div>
    </PageShell>
    <SiteFooter />
    <ScrollToTop />
  </div>
);

export default About;
