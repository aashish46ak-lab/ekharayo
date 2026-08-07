import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const META: Record<string, { title: string; key: string }> = {
  privacy: { title: "Privacy Policy", key: "privacy" },
  terms: { title: "Terms & Conditions", key: "terms" },
  shipping: { title: "Shipping Policy", key: "shipping" },
  returns: { title: "Return Policy", key: "returns" },
};

const Policy = () => {
  const { slug } = useParams();
  const meta = META[slug ?? ""] ?? null;
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meta) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", meta.key)
      .maybeSingle()
      .then(({ data }) => {
        const v = data?.value as { body?: string } | undefined;
        setBody(v?.body?.trim() || "");
        setLoading(false);
      });
  }, [meta]);

  if (!meta) {
    return (
      <div className="min-h-screen pt-14">
        <Navbar />
        <PageShell title="Not found" subtitle="This policy page does not exist">
          <div className="container mx-auto px-4 py-16 text-center">
            <Link to="/" className="text-primary font-semibold hover:underline">
              Home
            </Link>
          </div>
        </PageShell>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      <PageShell title={meta.title} subtitle="Great Sagarmatha Trade Pvt. Ltd. (eKharayo)">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              {body ? (
                <div className="font-body text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{body}</div>
              ) : (
                <p className="font-body text-sm text-muted-foreground">
                  Content for this policy will be published soon. For questions, please{" "}
                  <Link to="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      </PageShell>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Policy;
