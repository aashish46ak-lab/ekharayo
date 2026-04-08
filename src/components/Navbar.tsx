import { useState } from "react";
import logo from "@/assets/logo.png";
import { Menu, X, Home, ShoppingBasket, Info, Image, UserCircle, PackageCheck, Phone } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Products", href: "#products", icon: ShoppingBasket },
  { label: "About", href: "#about", icon: Info },
  { label: "Gallery", href: "#gallery", icon: Image },
  { label: "Ownership", href: "#ownership", icon: UserCircle },
  { label: "Bulk Order", href: "#bulk-order", icon: PackageCheck },
  { label: "Contact", href: "#contact", icon: Phone },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <a href="#home" className="flex items-center gap-2">
          <img src={logo} alt="Kharayo" width={40} height={40} />
          <span className="font-display text-xl font-bold text-primary">Kharayo <span className="font-body text-sm font-medium text-muted-foreground">(Great Himalayan Agro PVT. LTD.)</span></span>
        </a>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="flex items-center gap-1.5 font-body text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary px-3 py-2 rounded-lg transition-colors">
                <l.icon size={16} />
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu with backdrop */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-[57px] bg-foreground/30 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="md:hidden absolute left-0 right-0 bg-card border-t border-border shadow-xl z-50">
            <ul className="flex flex-col py-3 px-4 gap-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 font-body text-base font-medium text-foreground/80 hover:text-primary hover:bg-secondary px-4 py-3 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <l.icon size={18} className="text-primary" />
                    </div>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
