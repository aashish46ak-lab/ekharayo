import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isVideoUrl, uploadMedia, rs } from "@/lib/media";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Star, Eye, EyeOff, ImagePlus, Film } from "lucide-react";

interface Category {
  id: string;
  name: string;
}
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  unit: string | null;
  sku: string | null;
  barcode: string | null;
  weight: string | null;
  low_stock_threshold: number;
  images: string[];
  featured: boolean;
  is_active: boolean;
}

const empty = {
  name: "",
  slug: "",
  description: "",
  category_id: "",
  price: 0,
  sale_price: "" as number | "",
  stock: 0,
  unit: "litre",
  images: [] as string[],
  featured: false,
  is_active: true,
  sku: "",
  barcode: "",
  weight: "",
  low_stock_threshold: 5,
};

const field =
  "w-full border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/70";

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="mb-1.5">
    <label className="font-body text-xs font-semibold text-foreground block">{children}</label>
    {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
  </div>
);

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<null | (typeof empty & { id?: string })>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("sort_order"),
    ]);
    setProducts((p.data as unknown as Product[]) ?? []);
    setCategories((c.data as unknown as Category[]) ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Product name is required");
    setBusy(true);
    const payload = {
      name: editing.name.trim(),
      slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: editing.description,
      category_id: editing.category_id || null,
      price: Number(editing.price),
      sale_price: editing.sale_price === "" ? null : Number(editing.sale_price),
      stock: Number(editing.stock),
      unit: editing.unit,
      images: editing.images,
      featured: editing.featured,
      is_active: editing.is_active,
      sku: editing.sku || null,
      barcode: editing.barcode || null,
      weight: editing.weight || null,
      low_stock_threshold: Number(editing.low_stock_threshold),
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Product updated" : "Product created");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length || !editing) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const isVid = file.type.startsWith("video/");
        const url = await uploadMedia(file, isVid ? "products/videos" : "products/images");
        urls.push(url);
      }
      setEditing({ ...editing, images: [...editing.images, ...urls] });
      toast.success(`${urls.length} file(s) uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filtered = products.filter(
    (p) => !q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase()) || (p.sku ?? "").toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
          <p className="font-body text-sm text-muted-foreground">Add photos & videos buyers can scroll on the product page</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by product name or SKU…"
        className={`${field} mb-4 max-w-md`}
      />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm font-body">
          <thead className="bg-muted/50 text-muted-foreground text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const thumb = p.images?.find((u) => !isVideoUrl(u)) ?? p.images?.[0];
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {thumb && !isVideoUrl(thumb) ? (
                        <img src={thumb} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                          {p.images?.length ? `${p.images.length}` : "—"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          {p.name} {p.featured && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.images?.length || 0} media · {p.unit || "unit"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-foreground">{rs(Number(p.sale_price ?? p.price))}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    {p.is_active ? (
                      <span className="inline-flex items-center gap-1 text-primary text-xs"><Eye size={12} /> Live</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs"><EyeOff size={12} /> Hidden</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            description: p.description || "",
                            category_id: p.category_id || "",
                            price: p.price,
                            sale_price: p.sale_price ?? "",
                            stock: p.stock,
                            unit: p.unit || "unit",
                            images: p.images || [],
                            featured: p.featured,
                            is_active: p.is_active,
                            sku: p.sku || "",
                            barcode: p.barcode || "",
                            weight: p.weight || "",
                            low_stock_threshold: p.low_stock_threshold ?? 5,
                          })
                        }
                        className="p-2 rounded-lg hover:bg-muted text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <form onSubmit={save} className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{editing.id ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="p-1 rounded-lg hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <div>
              <Label hint="Shown on product cards and detail page">Product name *</Label>
              <input required placeholder="e.g. Fresh Cow Milk" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={field} />
            </div>

            <div>
              <Label hint="URL-friendly name (auto-filled if empty)">Slug (optional)</Label>
              <input placeholder="e.g. fresh-cow-milk" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={field} />
            </div>

            <div>
              <Label hint="Which shelf this product belongs to">Category</Label>
              <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className={field}>
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label hint="Regular selling price in NPR">Price (Rs.) *</Label>
                <input required type="number" min={0} step="0.01" placeholder="e.g. 80" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={field} />
              </div>
              <div>
                <Label hint="Discounted price — leave empty if none">Sale price (Rs.)</Label>
                <input type="number" min={0} step="0.01" placeholder="e.g. 70 (optional)" value={editing.sale_price} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value === "" ? "" : Number(e.target.value) })} className={field} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label hint="How many units available">Stock quantity</Label>
                <input type="number" min={0} placeholder="e.g. 50" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className={field} />
              </div>
              <div>
                <Label hint="Unit shown next to price">Unit</Label>
                <input placeholder="e.g. litre, kg, piece, pack" value={editing.unit || ""} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className={field} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label hint="Internal code for inventory">SKU (optional)</Label>
                <input placeholder="e.g. MILK-1L" value={editing.sku || ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} className={field} />
              </div>
              <div>
                <Label hint="Warn admin when stock goes below this">Low-stock alert at</Label>
                <input type="number" min={0} placeholder="e.g. 5" value={editing.low_stock_threshold} onChange={(e) => setEditing({ ...editing, low_stock_threshold: Number(e.target.value) })} className={field} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label hint="Barcode / QR if you use a scanner">Barcode (optional)</Label>
                <input placeholder="Scan or type barcode" value={editing.barcode || ""} onChange={(e) => setEditing({ ...editing, barcode: e.target.value })} className={field} />
              </div>
              <div>
                <Label hint="Package weight for delivery">Weight / size</Label>
                <input placeholder="e.g. 1 litre, 500g" value={editing.weight || ""} onChange={(e) => setEditing({ ...editing, weight: e.target.value })} className={field} />
              </div>
            </div>

            <div>
              <Label hint="What buyers read on the product page">Description</Label>
              <textarea rows={3} placeholder="e.g. Pure farm-fresh cow milk, delivered daily from Itahari." value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={`${field} resize-none`} />
            </div>

            <div className="rounded-xl border border-border p-3 space-y-2">
              <Label hint="Buyers can swipe/click through all photos & videos on the product page">Photos & videos</Label>
              <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-lg py-6 cursor-pointer hover:border-primary/50 transition-colors">
                <div className="flex gap-3 text-primary">
                  <ImagePlus size={22} />
                  <Film size={22} />
                </div>
                <span className="font-body text-xs text-muted-foreground text-center px-4">
                  {uploading ? "Uploading…" : "Tap to add multiple images or videos (JPG, PNG, MP4, WebM)"}
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => onUpload(e.target.files)}
                  className="hidden"
                />
              </label>
              {editing.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {editing.images.map((src, i) => (
                    <div key={`${src}-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                      {isVideoUrl(src) ? (
                        <>
                          <video src={src} muted className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center">VIDEO</span>
                        </>
                      ) : (
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 font-body text-sm text-foreground">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                Featured on homepage
              </label>
              <label className="flex items-center gap-2 font-body text-sm text-foreground">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Visible in shop
              </label>
            </div>

            <button disabled={busy || uploading} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-60">
              {(busy || uploading) && <Loader2 size={16} className="animate-spin" />} Save product
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
