import { useEffect, useState } from "react";
import { X, ZoomIn, Loader2, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    supabase
      .from("gallery_images" as never)
      .select("id,image_url,caption")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setImages((data as unknown as GalleryImage[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-12 flex justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-16 text-center">
        <ImageOff className="mx-auto text-muted-foreground mb-3" size={32} />
        <p className="font-body text-sm text-muted-foreground">Gallery photos will appear here once admin uploads them.</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="relative group overflow-hidden rounded-2xl border border-border shadow-lg w-72 md:w-96 aspect-[4/3]"
          >
            <img src={images[0].image_url} alt={images[0].caption || "Gallery"} loading="lazy" className="w-full h-full object-cover blur-sm scale-105" />
            <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center gap-2">
              <ZoomIn className="text-primary-foreground" size={36} />
              <span className="font-display text-lg font-bold text-primary-foreground">Click to View</span>
              <span className="font-body text-sm text-primary-foreground/70">{images.length} photos</span>
            </div>
          </button>
        </div>
      </div>

      {showAll && (
        <div className="fixed inset-0 z-[100] bg-foreground/90 overflow-y-auto p-4" onClick={() => setShowAll(false)}>
          <button type="button" onClick={() => setShowAll(false)} className="fixed top-4 right-4 text-primary-foreground bg-foreground/50 rounded-full p-2 z-10" aria-label="Close">
            <X size={24} />
          </button>
          <div className="max-w-4xl mx-auto pt-12 grid grid-cols-2 md:grid-cols-3 gap-3" onClick={(e) => e.stopPropagation()}>
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => { setShowAll(false); setSelected(i); setZoomed(false); }}
                className="group relative overflow-hidden rounded-xl border border-border/30 aspect-[4/3]"
              >
                <img src={img.image_url} alt={img.caption || ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {selected !== null && (
        <div className="fixed inset-0 z-[110] bg-foreground/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <button type="button" onClick={() => setSelected(null)} className="absolute top-4 right-4 text-primary-foreground bg-foreground/50 rounded-full p-2 z-10" aria-label="Close">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4 max-w-5xl w-full">
            <button type="button" onClick={(e) => { e.stopPropagation(); setSelected((selected - 1 + images.length) % images.length); setZoomed(false); }} className="text-primary-foreground text-3xl font-bold shrink-0">‹</button>
            <img
              src={images[selected].image_url}
              alt={images[selected].caption || ""}
              onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
              className={`max-h-[80vh] w-full object-contain rounded-lg cursor-zoom-in transition-transform ${zoomed ? "scale-150 cursor-zoom-out" : ""}`}
            />
            <button type="button" onClick={(e) => { e.stopPropagation(); setSelected((selected + 1) % images.length); setZoomed(false); }} className="text-primary-foreground text-3xl font-bold shrink-0">›</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
