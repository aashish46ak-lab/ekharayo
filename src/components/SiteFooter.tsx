import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const SiteFooter = () => (
  <footer className="border-t border-border bg-card/50 py-8">
    <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <Link to="/" className="inline-flex items-center">
        <img src={logo} alt="eKharayo — Great Sagarmatha Traders" className="h-10 w-auto" loading="lazy" />
      </Link>
      <p className="font-body text-xs text-muted-foreground max-w-md">
        The official digital marketplace of Great Sagarmatha Traders — quality agricultural products from Nepal
        and trusted international suppliers.
      </p>
      <p className="font-body text-xs text-muted-foreground">
        © {new Date().getFullYear()} Great Sagarmatha Traders (eKharayo). All Rights Reserved.
      </p>
      <span className="group inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 shadow-[0_0_18px_-6px_hsl(var(--primary))] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_26px_-4px_hsl(var(--primary))]">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="font-body text-[11px] font-medium tracking-wide text-muted-foreground">
          Developed by{" "}
          <span className="font-semibold text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]">Ashish</span>
        </span>
      </span>
    </div>
  </footer>
);

export default SiteFooter;
