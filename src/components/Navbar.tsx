import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, Home, ShoppingBasket, Info, Image, UserCircle, PackageCheck, Phone } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: ShoppingBasket },
  { label: "About", href: "/about", icon: Info },
  { label: "Gallery", href: "/gallery", icon: Image },
  { label: "Ownership", href: "/ownership", icon: UserCircle },
  { label: "Bulk Order", href: "/bulk-order", icon: PackageCheck },
  { label: "Contact", href: "/contact", icon: Phone },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-2 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Kharayo" width={40} height={40} />
            <span className="font-display text-lg font-bold text-primary leading-tight">Kharayo <span className="font-body text-[10px] font-medium text-muted-foreground block leading-tight">(Great Himalayan Agro PVT. LTD.)</span></span>
          </Link>

          {/* Desktop */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className={`flex items-center gap-1.5 font-body text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                    location.pathname === l.href
                      ? "text-primary bg-secondary"
                      : "text-foreground/80 hover:text-primary hover:bg-secondary"
                  }`}
                >
                  <l.icon size={14} />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-foreground" aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu from right */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-[49px] right-0 z-50 w-48 bg-card/95 backdrop-blur-md border-l border-b border-border shadow-xl rounded-bl-xl md:hidden">
            <ul className="flex flex-col gap-1 p-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 font-body text-[12px] font-medium border border-border/50 rounded-lg px-3 py-2 transition-colors ${
                      location.pathname === l.href
                        ? "text-primary bg-secondary"
                        : "text-foreground/70 hover:text-primary bg-secondary/60 hover:bg-secondary"
                    }`}
                  >
                    <l.icon size={15} className="text-primary shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
