import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import gallery1 from "@/assets/gallery1.jpg";
import gallery2 from "@/assets/gallery2.jpg";
import gallery3 from "@/assets/gallery3.jpg";
import gallery4 from "@/assets/gallery4.jpg";
import gallery5 from "@/assets/gallery5.jpg";
import gallery6 from "@/assets/gallery6.jpg";
import gallery7 from "@/assets/gallery7.jpg";
import gallery8 from "@/assets/gallery8.jpg";
import gallery9 from "@/assets/gallery9.jpg";

const images = [
  { src: gallery1, alt: "Cows feeding in the shed" },
  { src: gallery2, alt: "Inside the cattle shed" },
  { src: gallery3, alt: "Healthy cows at the farm" },
  { src: gallery4, alt: "Farm infrastructure and fencing" },
  { src: gallery5, alt: "Cattle grazing in the field" },
  { src: gallery6, alt: "Kids at the poultry farm" },
  { src: gallery7, alt: "Farm tractor and equipment" },
  { src: gallery8, alt: "Inside the processing facility" },
  { src: gallery9, alt: "Farm operations and setup" },
];

const GallerySection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="relative group overflow-hidden rounded-2xl border border-border shadow-lg w-72 md:w-96 aspect-[4/3]"
          >
            <img src={gallery1} alt="Farm preview" loading="lazy" className="w-full h-full object-cover blur-sm scale-105" />
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
          <button
            onClick={() => setShowAll(false)}
            className="fixed top-4 right-4 text-primary-foreground bg-foreground/50 rounded-full p-2 hover:bg-foreground/70 transition-colors z-10"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto pt-12 grid grid-cols-2 md:grid-cols-3 gap-3" onClick={(e) => e.stopPropagation()}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setShowAll(false); setSelected(i); setZoomed(false); }}
                className="group relative overflow-hidden rounded-xl border border-border/30 aspect-[4/3]"
              >
                <img src={img.src} alt={img.alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected !== null && (
        <div
          className="fixed inset-0 z-[110] bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-primary-foreground bg-foreground/50 rounded-full p-2 hover:bg-foreground/70 transition-colors z-10"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 max-w-5xl w-full">
            <button
              onClick={(e) => { e.stopPropagation(); setSelected((selected - 1 + images.length) % images.length); setZoomed(false); }}
              className="text-primary-foreground text-3xl font-bold hover:text-primary transition-colors shrink-0"
            >‹</button>

            <img
              src={images[selected].src}
              alt={images[selected].alt}
              onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
              className={`max-h-[80vh] w-full object-contain rounded-lg cursor-zoom-in transition-transform duration-300 ${zoomed ? "scale-150 cursor-zoom-out" : ""}`}
            />

            <button
              onClick={(e) => { e.stopPropagation(); setSelected((selected + 1) % images.length); setZoomed(false); }}
              className="text-primary-foreground text-3xl font-bold hover:text-primary transition-colors shrink-0"
            >›</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
