import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Menu, X, Home, ShoppingBasket, Info, Image, UserCircle, PackageCheck, Phone, ShoppingCart, LayoutDashboard, LogIn, LogOut, ReceiptText, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/i18n/LanguageContext";
import SmartSearchBar from "./SmartSearchBar";
import { InstallButton } from "./InstallPrompt";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { count } = useCart();
  const { user, isAdmin, signOut, openAuthModal } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? "bg-card/95 backdrop-blur-xl border-b border-border shadow-lg shadow-black/30"
    : "bg-[#070b12]/90 backdrop-blur-md border-b border-border/50";

  const navLinks = [
    { label: t("home"), href: "/", icon: Home },
    { label: t("products"), href: "/products", icon: ShoppingBasket },
    { label: t("about"), href: "/about", icon: Info },
    { label: t("gallery"), href: "/gallery", icon: Image },
    { label: t("ownership"), href: "/ownership", icon: UserCircle },
    { label: t("bulk"), href: "/bulk-order", icon: PackageCheck },
    { label: t("contact"), href: "/contact", icon: Phone },
  ];

  const accountLinks = [
    { label: t("orders"), href: "/my-orders", icon: ReceiptText },
    { label: t("wishlist"), href: "/wishlist", icon: Heart },
    ...(isAdmin ? [{ label: t("admin"), href: "/admin", icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="container mx-auto flex items-center justify-between gap-2 py-2.5 px-3 sm:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src={logo} alt="eKharayo" className="h-8 sm:h-9 w-auto shrink-0" />
              <span className="font-display text-sm sm:text-base font-bold leading-tight text-primary min-w-0">
                eKharayo
                <span className="font-body text-[8px] sm:text-[9px] font-medium block leading-tight tracking-wide text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                  Great Sagarmatha Trade Pvt. Ltd.
                </span>
              </span>
            </Link>
            <InstallButton />
          </div>

          <div className="hidden md:block flex-1 max-w-xs mx-2">
            <SmartSearchBar variant="navbar" />
          </div>

          <ul className="hidden lg:flex items-center gap-0.5">
            {[...navLinks.slice(0, 4), ...accountLinks].map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className={`flex items-center gap-1.5 font-body text-xs font-medium px-2 py-1.5 rounded-md transition-all ${
                    location.pathname === l.href ? "text-primary bg-primary/15" : "text-foreground/70 hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  <l.icon size={14} />
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              {user ? (
                <button type="button" onClick={() => signOut()} className="flex items-center gap-1.5 font-body text-xs font-medium px-2 py-1.5 rounded-md text-foreground/70 hover:text-primary hover:bg-primary/10">
                  <LogOut size={14} /> {t("signOut")}
                </button>
              ) : (
                <button type="button" onClick={() => openAuthModal()} className="flex items-center gap-1.5 font-body text-xs font-medium px-2 py-1.5 rounded-md text-foreground/70 hover:text-primary hover:bg-primary/10">
                  <LogIn size={14} /> {t("signIn")}
                </button>
              )}
            </li>
          </ul>

          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && (
              <Link
                to="/admin"
                aria-label="Admin dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 font-body text-xs font-semibold px-2.5 py-1.5 rounded-md bg-primary/15 text-primary hover:bg-primary/25"
              >
                <LayoutDashboard size={16} /> Admin
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" aria-label="Admin dashboard" className="sm:hidden p-2 rounded-md text-primary hover:bg-primary/10">
                <LayoutDashboard size={18} />
              </Link>
            )}
            <Link to="/wishlist" aria-label={t("wishlist")} className="p-2 rounded-md text-foreground hover:bg-primary/10">
              <Heart size={18} />
            </Link>
            <Link to="/cart" aria-label={t("cart")} className="relative p-2 rounded-md text-foreground hover:bg-primary/10">
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground font-body text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{count}</span>
              )}
            </Link>
            <button type="button" onClick={() => setOpen(!open)} className="lg:hidden text-foreground p-1" aria-label="Toggle menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed top-[52px] right-0 z-50 w-64 max-w-[85vw] bg-card border-l border-b border-border shadow-2xl rounded-bl-2xl lg:hidden">
            <div className="p-3 border-b border-border md:hidden">
              <SmartSearchBar variant="navbar" />
            </div>
            <ul className="flex flex-col gap-1 p-3 max-h-[70vh] overflow-y-auto">
              {[...navLinks, ...accountLinks].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} onClick={() => setOpen(false)} className={`flex items-center gap-2.5 font-body text-[12px] font-medium rounded-lg px-3 py-2.5 ${location.pathname === l.href ? "text-primary bg-primary/15" : "text-foreground/70 hover:text-primary hover:bg-primary/10"}`}>
                    <l.icon size={15} className="text-primary shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                {user ? (
                  <button type="button" onClick={() => { setOpen(false); signOut(); }} className="w-full flex items-center gap-2.5 font-body text-[12px] font-medium rounded-lg px-3 py-2.5 text-foreground/70 hover:text-primary hover:bg-primary/10">
                    <LogOut size={15} className="text-primary shrink-0" /> {t("signOut")}
                  </button>
                ) : (
                  <button type="button" onClick={() => { setOpen(false); openAuthModal(); }} className="w-full flex items-center gap-2.5 font-body text-[12px] font-medium rounded-lg px-3 py-2.5 text-foreground/70 hover:text-primary hover:bg-primary/10">
                    <LogIn size={15} className="text-primary shrink-0" /> {t("signIn")}
                  </button>
                )}
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
