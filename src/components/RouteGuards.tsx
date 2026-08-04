import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
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

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, banned, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (banned) return <BannedScreen />;
  return <>{children}</>;
};

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, banned, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (banned) return <BannedScreen />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const RequireSuperAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isSuperAdmin, banned, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (banned) return <BannedScreen />;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};
