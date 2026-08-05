import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "manager" | "staff" | "customer" | "user";
export const STAFF_ROLES: AppRole[] = ["super_admin", "admin", "manager", "staff"];

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  banned: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  authNext: string | null;
  openAuthModal: (next?: string) => void;
  closeAuthModal: () => void;
  isGuest: boolean;
  setGuest: (val: boolean) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  roles: [],
  isAdmin: false,
  isSuperAdmin: false,
  banned: false,
  loading: true,
  signOut: async () => {},
  isAuthModalOpen: false,
  authNext: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isGuest: false,
  setGuest: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [banned, setBanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNext, setAuthNext] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem("ekharayo_guest_mode") === "true");

  const setGuest = (val: boolean) => {
    setIsGuest(val);
    if (val) localStorage.setItem("ekharayo_guest_mode", "true");
    else localStorage.removeItem("ekharayo_guest_mode");
  };

  const loadRole = (userId: string) => {
    // deferred to avoid deadlocks inside the auth callback
    setTimeout(async () => {
      const [{ data: roleRows }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("profiles").select("banned").eq("id", userId).maybeSingle(),
      ]);
      setRoles(((roleRows ?? []) as { role: AppRole }[]).map((r) => r.role));
      setBanned(!!(profile as { banned?: boolean } | null)?.banned);
      setLoading(false);
    }, 0);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        loadRole(s.user.id);
        setIsAuthModalOpen(false);
        setGuest(false);
      } else {
        setRoles([]);
        setBanned(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadRole(data.session.user.id);
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRoles([]);
    setBanned(false);
    setGuest(false);
  };

  const openAuthModal = (next?: string) => {
    setAuthNext(next ?? null);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthNext(null);
  };

  const isAdmin = roles.some((r) => STAFF_ROLES.includes(r));
  const isSuperAdmin = roles.includes("super_admin");

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        roles,
        isAdmin,
        isSuperAdmin,
        banned,
        loading,
        signOut,
        isAuthModalOpen,
        authNext,
        openAuthModal,
        closeAuthModal,
        isGuest,
        setGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
