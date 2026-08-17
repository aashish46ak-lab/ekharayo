import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let sharedDeferred: BIPEvent | null = null;
const listeners = new Set<() => void>();

function setDeferred(e: BIPEvent | null) {
  sharedDeferred = e;
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setDeferred(e as BIPEvent);
  });
  window.addEventListener("appinstalled", () => setDeferred(null));
}

/** Compact install control for navbar (beside brand). */
export function InstallButton({ className = "" }: { className?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  if (!sharedDeferred) return null;

  return (
    <button
      type="button"
      title="Install eKharayo app"
      onClick={async () => {
        if (!sharedDeferred) return;
        await sharedDeferred.prompt();
        await sharedDeferred.userChoice;
        setDeferred(null);
      }}
      className={`inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-[10px] sm:text-xs font-semibold text-primary hover:bg-primary/25 transition-colors shrink-0 ${className}`}
    >
      <Download size={12} />
      <span className="hidden xs:inline sm:inline">Install</span>
    </button>
  );
}

/** Bottom bar removed — install lives in navbar to reduce clutter. */
const InstallPrompt = () => null;

export default InstallPrompt;
