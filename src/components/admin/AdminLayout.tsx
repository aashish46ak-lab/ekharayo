import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Globe,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  ShieldCheck,
  MessageSquare,
  Images,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: "orders" as const },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, badge: "messages" as const },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/website", label: "Website", icon: Globe },
  { to: "/admin/notifications", label: "Notifications", icon: Bell, badge: "notifs" as const },
];

const AdminLayout = () => {
  const { signOut, isSuperAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [ordersBadge, setOrdersBadge] = useState(0);
  const [messagesBadge, setMessagesBadge] = useState(0);
  const [notifsBadge, setNotifsBadge] = useState(0);

  const refreshBadges = async () => {
    const [ordersRes, threadsRes, notifsRes, msgsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "confirmed", "processing"]),
      supabase.from("chat_threads" as never).select("id,status").neq("status", "closed"),
      supabase.from("notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("chat_messages" as never).select("thread_id,sender,created_at").order("created_at", { ascending: false }).limit(200),
    ]);

    setOrdersBadge(ordersRes.count ?? 0);
    setNotifsBadge(notifsRes.count ?? 0);

    // Unread-ish: open threads whose latest message is from customer
    const threads = (threadsRes.data as { id: string; status: string }[] | null) ?? [];
    const msgs = (msgsRes.data as { thread_id: string; sender: string }[] | null) ?? [];
    const latestByThread = new Map<string, string>();
    for (const m of msgs) {
      if (!latestByThread.has(m.thread_id)) latestByThread.set(m.thread_id, m.sender);
    }
    let waiting = 0;
    for (const t of threads) {
      const last = latestByThread.get(t.id);
      if (last && last !== "admin") waiting += 1;
      else if (!last) waiting += 1;
    }
    setMessagesBadge(waiting);
  };

  useEffect(() => {
    refreshBadges();
    const channel = supabase
      .channel("admin-badges-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, refreshBadges)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, refreshBadges)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, refreshBadges)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, refreshBadges)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const badgeFor = (key?: "orders" | "messages" | "notifs") => {
    if (key === "orders") return ordersBadge;
    if (key === "messages") return messagesBadge;
    if (key === "notifs") return notifsBadge;
    return 0;
  };

  const item = (isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors ${
      isActive ? "bg-[#232f3e] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#eaeded] flex flex-col">
      {/* Top bar — seller-console style */}
      <header className="sticky top-0 z-40 bg-[#232f3e] text-white border-b border-black/20">
        <div className="flex items-center gap-3 px-3 sm:px-4 h-12">
          <button type="button" className="lg:hidden p-1.5 rounded hover:bg-white/10" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <Link to="/admin" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="eKharayo" className="h-7 w-auto brightness-110" />
            <span className="font-display font-bold text-sm hidden sm:block">Seller Central</span>
          </Link>
          <div className="flex-1" />
          <Link to="/admin/orders" className="relative p-2 rounded hover:bg-white/10" title="Orders">
            <ShoppingBag size={18} />
            {ordersBadge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f90] text-[#111] text-[10px] font-bold flex items-center justify-center">
                {ordersBadge > 99 ? "99+" : ordersBadge}
              </span>
            )}
          </Link>
          <Link to="/admin/messages" className="relative p-2 rounded hover:bg-white/10" title="Messages">
            <MessageSquare size={18} />
            {messagesBadge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f90] text-[#111] text-[10px] font-bold flex items-center justify-center">
                {messagesBadge > 99 ? "99+" : messagesBadge}
              </span>
            )}
          </Link>
          <Link to="/admin/notifications" className="relative p-2 rounded hover:bg-white/10" title="Notifications">
            <Bell size={18} />
            {notifsBadge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {notifsBadge > 99 ? "99+" : notifsBadge}
              </span>
            )}
          </Link>
          <span className="hidden md:inline font-body text-xs text-slate-300 truncate max-w-[140px]">{user?.email}</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-[#1b2430] text-slate-200 flex-col pt-12 lg:pt-0 transition-transform duration-300 ${
            open ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between lg:justify-start gap-2">
            <div className="lg:hidden font-display font-bold text-white">Menu</div>
            <button type="button" className="lg:hidden p-1" onClick={() => setOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {links.map((l) => {
              const count = badgeFor(l.badge);
              return (
                <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => item(isActive)}>
                  <l.icon size={17} className="shrink-0 opacity-90" />
                  <span className="flex-1">{l.label}</span>
                  {count > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#f90] text-[#111] text-[10px] font-bold flex items-center justify-center">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </NavLink>
              );
            })}
            {isSuperAdmin && (
              <NavLink to="/admin/staff" onClick={() => setOpen(false)} className={({ isActive }) => item(isActive)}>
                <ShieldCheck size={17} /> Staff
              </NavLink>
            )}
          </nav>
          <div className="p-3 border-t border-white/10 space-y-0.5">
            <Link to="/" className={item(false)}>
              <Home size={17} /> View storefront
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className={`w-full ${item(false)}`}
            >
              <LogOut size={17} /> Sign out
            </button>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
