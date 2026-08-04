import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const SiteFooter = () => (
  <footer className="border-t border-border bg-card/50 py-8">
    <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <Link to="/" className="inline-flex items-center">
        <img src={logo} alt="eKharayo — Great Sagarmatha Trade Pvt. Ltd." className="h-10 w-auto" loading="lazy" />
      </Link>
      <p className="font-body text-xs text-muted-foreground max-w-md">
        The official digital marketplace of Great Sagarmatha Trade Pvt. Ltd. — quality agricultural products from Nepal
        and trusted international suppliers.
      </p>
      <p className="font-body text-xs text-muted-foreground">
        © {new Date().getFullYear()} Great Sagarmatha Trade Pvt. Ltd. (eKharayo). All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default SiteFooter;
