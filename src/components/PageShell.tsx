import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bgClass?: string;
}

const PageShell = ({ title, subtitle, children, bgClass = "bg-secondary" }: PageShellProps) => {
  return (
    <>
      {/* Page hero banner */}
      <div className="relative bg-gradient-to-br from-primary/90 to-[hsl(var(--hero-overlay))] py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-green-glow rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground font-body text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground mb-3">{title}</h1>
          {subtitle && <p className="font-body text-primary-foreground/70 text-base md:text-lg max-w-xl mx-auto">{subtitle}</p>}
        </div>
      </div>
      {/* Page content */}
      <div className={bgClass}>
        {children}
      </div>
    </>
  );
};

export default PageShell;
