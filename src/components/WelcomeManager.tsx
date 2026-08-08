/**
 * Previously auto-opened the auth modal on first visit.
 * That can block content for AdSense / crawlers (intrusive interstitial).
 * Auth modal still opens when the user clicks Sign in / Checkout requires auth.
 * "Continue as Guest" remains available inside the modal.
 */
const WelcomeManager = () => null;

export default WelcomeManager;
