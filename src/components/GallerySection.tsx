import { useEffect, useState } from "react";
import { X, Loader2, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import gallery1 from "@/assets/gallery1.jpg";
import gallery2 from "@/assets/gallery2.jpg";
import gallery3 from "@/assets/gallery3.jpg";
import gallery4 from "@/assets/gallery4.jpg";
import gallery5 from "@/assets/gallery5.jpg";
import gallery6 from "@/assets/gallery6.jpg";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

const FALLBACK: GalleryImage[] = [
  { id: "f1", image_url: gallery1, caption: "Farm work" },
  { id: "f2", image_url: gallery2, caption: "Fresh produce" },
  { id: "f3", image_url: gallery3, caption: "Local livestock" },
  { id: "f4", image_url: gallery4, caption: "Field harvest" },
  { id: "f5", image_url: gallery5, caption: "Quality check" },
  { id: "f6", image_url: gallery6, caption: "Ready to deliver" },
];

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("gallery_images" as never)
      .select("id,image_url,caption")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        const rows = (data as unknown as GalleryImage[]) ?? [];
        setImages(rows.length ? rows : FALLBACK);
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
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">From our farms</h2>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">Real work, real produce — tap any photo to view full size</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 max-w-5xl mx-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(i)}
              className={`group relative overflow-hidden rounded-xl border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                i === 0 ? "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto md:min-h-[280px]" : "aspect-[4/3]"
              }`}
            >
              <img
                src={img.image_url}
                alt={img.caption || "Gallery"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {img.caption && (
                <span className="absolute bottom-2 left-2 right-2 text-left font-body text-[11px] sm:text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                  {img.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selected !== null && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <button type="button" onClick={() => setSelected(null)} className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 z-10" aria-label="Close">
            <X size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelected((selected - 1 + images.length) % images.length);
            }}
            className="absolute left-3 sm:left-6 text-white bg-white/10 rounded-full p-2"
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={images[selected].image_url} alt={images[selected].caption || ""} className="max-h-[80vh] w-full object-contain rounded-lg" />
            {images[selected].caption && (
              <p className="text-center text-white/80 font-body text-sm mt-3">{images[selected].caption}</p>
            )}
            <p className="text-center text-white/40 text-xs mt-1">
              {selected + 1} / {images.length}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelected((selected + 1) % images.length);
            }}
            className="absolute right-3 sm:right-6 text-white bg-white/10 rounded-full p-2"
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
