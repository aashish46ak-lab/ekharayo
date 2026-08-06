import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AUTH_ROUTES = ["/auth", "/reset-password"];

const WelcomeManager = () => {
  const { user, openAuthModal, loading } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    if (loading) return;
    // Never cover the dedicated auth page with the popup
    if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return;

    const hasSeenWelcome = localStorage.getItem("ekharayo_seen_welcome");
    const isGuest = localStorage.getItem("ekharayo_guest_mode") === "true";

    if (!user && !hasSeenWelcome && !isGuest) {
      // First visit, not logged in, not previously a guest
      openAuthModal();
      localStorage.setItem("ekharayo_seen_welcome", "true");
    }
  }, [user, openAuthModal, loading, pathname]);

  return null;
};

export default WelcomeManager;
