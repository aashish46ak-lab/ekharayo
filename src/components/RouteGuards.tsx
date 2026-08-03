import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="animate-spin text-primary" size={28} />
  </div>
);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
};

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
