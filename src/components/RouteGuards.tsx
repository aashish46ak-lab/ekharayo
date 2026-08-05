import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="animate-spin text-primary" size={28} />
  </div>
);

const BannedScreen = () => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center space-y-4">
        <ShieldAlert size={40} className="mx-auto text-destructive" />
        <h1 className="font-display text-xl font-bold text-foreground">Account suspended</h1>
        <p className="font-body text-sm text-muted-foreground">
          Your account has been suspended by an administrator. Please contact support if you believe this is a mistake.
        </p>
        <button
          onClick={() => signOut()}
          className="w-full bg-primary text-primary-foreground font-body font-semibold py-3 rounded-lg hover:bg-green-glow transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

const AuthRequiredScreen = () => {
  const { openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    openAuthModal();
  }, [openAuthModal]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center space-y-5">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Lock size={32} className="text-primary" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">Authentication required</h1>
        <p className="font-body text-sm text-muted-foreground">
          Please sign in to access this page. You can also continue as a guest to browse, but this feature requires an account.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => openAuthModal()}
            className="w-full bg-primary text-primary-foreground font-body font-semibold py-3 rounded-lg hover:bg-green-glow transition-colors"
          >
            Sign in / Sign up
          </button>
          <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} className="hidden" />
          <p className="text-xs text-muted-foreground">
            Or <a href="/" className="text-primary hover:underline">return home</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, banned, loading, isGuest } = useAuth();
  
  if (loading) return <Spinner />;
  if (banned) return <BannedScreen />;
  
  // Special case: if it's a checkout page, we might allow guests
  const location = useLocation();
  const isCheckout = location.pathname.startsWith("/checkout");
  
  if (!user) {
    if (isCheckout && isGuest) {
      return <>{children}</>;
    }
    return <AuthRequiredScreen />;
  }
  
  return <>{children}</>;
};

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, banned, loading } = useAuth();
  if (loading) return <Spinner />;
  if (banned) return <BannedScreen />;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const RequireSuperAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isSuperAdmin, banned, loading } = useAuth();
  if (loading) return <Spinner />;
  if (banned) return <BannedScreen />;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};
