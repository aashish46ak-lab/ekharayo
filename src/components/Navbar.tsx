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
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On home: transparent until scrolled. On other pages: always solid.
  const navBg = !isHome || scrolled
    ? "bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm"
    : "bg-black/20 backdrop-blur-md border-b border-white/10";

  const textColor = !isHome || scrolled ? "text-foreground" : "text-white";
  const activeColor = !isHome || scrolled ? "text-primary bg-primary/10" : "text-emerald-300 bg-white/10";
  const hoverColor = !isHome || scrolled ? "hover:text-primary hover:bg-primary/5" : "hover:text-emerald-300 hover:bg-white/10";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="container mx-auto flex items-center justify-between py-2.5 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Kharayo" className="h-8 w-auto" />
            <span className={`font-display text-lg font-bold leading-tight ${!isHome || scrolled ? "text-primary" : "text-white"}`}>
              Kharayo
              <span className={`font-body text-[10px] font-medium block leading-tight tracking-wide ${!isHome || scrolled ? "text-muted-foreground" : "text-white/60"}`}>
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
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed top-[53px] right-0 z-50 w-52 bg-white/90 backdrop-blur-xl border-l border-b border-black/10 shadow-2xl rounded-bl-2xl md:hidden">
            <ul className="flex flex-col gap-1 p-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 font-body text-[12px] font-medium rounded-lg px-3 py-2.5 transition-all duration-200 ${
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
