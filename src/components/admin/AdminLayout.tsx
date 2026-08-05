import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Tags, ShoppingBag, Users, Globe, BarChart3, Bell, LogOut, Menu, X, Home, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/website", label: "Website", icon: Globe },
];

const AdminLayout = () => {
  const { signOut, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("is_read", false);
      setUnread(count ?? 0);
    };
    load();
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const item = (isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors ${
      isActive ? "bg-primary/15 text-primary" : "text-foreground/70 hover:text-primary hover:bg-primary/10"
    }`;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border p-4 flex-col transition-transform duration-300 ${open ? "flex" : "hidden lg:flex"}`}>
        <Link to="/admin" className="flex items-center gap-2 mb-6 px-1">
          <img src={logo} alt="eKharayo" className="h-9 w-auto" />
          <span className="font-display text-lg font-bold text-primary leading-tight">
            eKharayo
            <span className="block font-body text-[10px] text-muted-foreground">Admin Console</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => item(isActive)}>
              <l.icon size={17} /> {l.label}
            </NavLink>
          ))}
          <NavLink to="/admin/notifications" onClick={() => setOpen(false)} className={({ isActive }) => item(isActive)}>
            <Bell size={17} /> Notifications
          {isSuperAdmin && (
            <NavLink to="/admin/staff" onClick={() => setOpen(false)} className={({ isActive }) => item(isActive)}>
              <ShieldCheck size={17} /> Staff Management
            </NavLink>
          )}
            {unread > 0 && <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">{unread}</span>}
          </NavLink>
        </nav>
        <div className="space-y-1 pt-4 border-t border-border">
          <Link to="/" className={item(false)}><Home size={17} /> View website</Link>
          <button onClick={async () => { await signOut(); navigate("/"); }} className={`w-full ${item(false)}`}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-card border-b border-border px-4 py-3">
          <span className="font-display font-bold text-primary">eKharayo Admin</span>
          <button onClick={() => setOpen(!open)} aria-label="Toggle admin menu" className="text-foreground">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
