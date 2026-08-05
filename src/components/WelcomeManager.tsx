import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const WelcomeManager = () => {
  const { user, openAuthModal, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const hasSeenWelcome = localStorage.getItem("ekharayo_seen_welcome");
    const isGuest = localStorage.getItem("ekharayo_guest_mode") === "true";

    if (!user && !hasSeenWelcome && !isGuest) {
      // First visit, not logged in, not previously a guest
      openAuthModal();
      localStorage.setItem("ekharayo_seen_welcome", "true");
    }
  }, [user, openAuthModal, loading]);

  return null;
};

export default WelcomeManager;
