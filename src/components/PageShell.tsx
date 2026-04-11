import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const PageShell = ({ title, subtitle, children }: PageShellProps) => {
  return (
    <>
      {/* Page hero banner — dark futuristic */}
      <div className="relative bg-gradient-to-br from-secondary to-background py-20 md:py-28 overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-body text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mb-3 opacity-0 animate-fade-in-up">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-muted-foreground text-base md:text-lg max-w-xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {/* Page content */}
      <div className="bg-background">{children}</div>
    </>
  );
};

export default PageShell;
