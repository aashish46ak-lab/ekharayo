import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? "bg-card/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/10"
    : "bg-black/20 backdrop-blur-md border-b border-white/5";

  const textColor = scrolled ? "text-foreground" : "text-white";
  const activeColor = scrolled ? "text-primary bg-primary/15" : "text-primary bg-white/10";
  const hoverColor = scrolled ? "hover:text-primary hover:bg-primary/10" : "hover:text-primary hover:bg-white/10";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="container mx-auto flex items-center justify-between py-2.5 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="eKharayo — Great Sagarmatha Agro Pvt. Ltd." className="h-9 md:h-10 w-auto shrink-0" />
            <span className={`font-display text-lg font-bold leading-tight ${scrolled ? "text-primary" : "text-white"}`}>
              eKharayo
              <span className={`font-body text-[10px] font-medium block leading-tight tracking-wide ${scrolled ? "text-muted-foreground" : "text-white/60"}`}>
                (Great Sagarmatha Agro Pvt. Ltd.)
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
                      ? activeColor
                      : `${textColor}/70 ${hoverColor}`
                  }`}
                >
                  <l.icon size={14} />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <button onClick={() => setOpen(!open)} className={`md:hidden ${textColor}`} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed top-[53px] right-0 z-50 w-52 bg-card/95 backdrop-blur-xl border-l border-b border-border shadow-2xl rounded-bl-2xl md:hidden">
            <ul className="flex flex-col gap-1 p-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 font-body text-[12px] font-medium rounded-lg px-3 py-2.5 transition-all duration-200 ${
                      location.pathname === l.href
                        ? "text-primary bg-primary/15"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/10"
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
