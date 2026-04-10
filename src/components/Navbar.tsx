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
      {/* Glassmorphism navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/60 backdrop-blur-xl border-b border-card/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto flex items-center justify-between py-2 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Kharayo" className="h-8 w-auto" />
            <span className="font-display text-lg font-bold text-primary leading-tight">
              Kharayo
              <span className="font-body text-[10px] font-medium text-muted-foreground block leading-tight tracking-wide">
                (Great Himalayan Agro PVT. LTD.)
              </span>
            </span>
          </Link>

          {/* Desktop */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className={`flex items-center gap-1.5 font-body text-xs font-medium px-2.5 py-1.5 rounded-md transition-all duration-200 ${
                    location.pathname === l.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5 hover:-translate-y-px"
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

      {/* Mobile glassmorphism menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-[49px] right-0 z-50 w-48 bg-card/80 backdrop-blur-xl border-l border-b border-card/20 shadow-xl rounded-bl-xl md:hidden">
            <ul className="flex flex-col gap-1 p-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 font-body text-[12px] font-medium rounded-lg px-3 py-2 transition-all duration-200 ${
                      location.pathname === l.href
                        ? "text-primary bg-primary/10"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
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
