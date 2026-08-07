import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./pwa";

// Always dark theme
document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme = "dark";
document.body.style.backgroundColor = "hsl(220 25% 5%)";

createRoot(document.getElementById("root")!).render(<App />);

registerPWA();
