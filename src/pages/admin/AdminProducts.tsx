import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia, rs } from "@/lib/media";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Star, Eye, EyeOff } from "lucide-react";

interface Category { id: string; name: string }
interface Product {
  id: string; name: string; slug: string; description: string; category_id: string | null;
  price: number; sale_price: number | null; stock: number; unit: string | null;
  images: string[]; featured: boolean; is_active: boolean;
}

const empty = {
  name: "", slug: "", description: "", category_id: "", price: 0, sale_price: "" as number | "",
  stock: 0, unit: "unit", images: [] as string[], featured: false, is_active: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<null | (typeof empty & { id?: string })>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("sort_order"),
    ]);
    setProducts((p.data as unknown as Product[]) ?? []);
    setCategories((c.data as unknown as Category[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    const payload = {
      name: editing.name,
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
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Product saved");
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    load();
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || !editing) return;
    setBusy(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadMedia(f, "products")));
      setEditing({ ...editing, images: [...editing.images, ...urls] });
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusy(false);
  };

  const field = "w-full border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Products</h1>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className={`${field} w-48`} />
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors"><Plus size={16} /> Add</button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full font-body text-sm">
          <thead><tr className="text-left text-muted-foreground border-b border-border">
            <th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4"></th>
          </tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4 flex items-center gap-3">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-muted" />}
                  <span className="text-foreground">{p.name} {p.featured && <Star size={12} className="inline text-accent" />}</span>
                </td>
                <td className="p-4 text-muted-foreground">{categories.find((c) => c.id === p.category_id)?.name ?? "—"}</td>
                <td className="p-4 text-foreground">{rs(Number(p.sale_price ?? p.price))}</td>
                <td className={`p-4 ${p.stock <= 5 ? "text-accent" : "text-muted-foreground"}`}>{p.stock}</td>
                <td className="p-4">{p.is_active ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} className="text-muted-foreground" />}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button onClick={() => setEditing({ ...p, category_id: p.category_id ?? "", sale_price: p.sale_price ?? "", unit: p.unit ?? "unit", images: p.images ?? [], description: p.description ?? "" })} className="p-2 text-muted-foreground hover:text-primary"><Pencil size={15} /></button>
                  <button onClick={() => del(p.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No products found.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4">
          <form onSubmit={save} className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">{editing.id ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={field} />
              <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className={field}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Price" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={field} />
              <input type="number" step="0.01" placeholder="Sale price (optional)" value={editing.sale_price} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value === "" ? "" : Number(e.target.value) })} className={field} />
              <input type="number" placeholder="Stock" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className={field} />
              <input placeholder="Unit (kg, litre...)" value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className={field} />
            </div>
            <textarea rows={3} placeholder="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={`${field} resize-none`} />
            <div>
              <label className="font-body text-sm text-foreground block mb-2">Images</label>
              <input type="file" accept="image/*" multiple onChange={(e) => onUpload(e.target.files)} className="font-body text-sm text-muted-foreground" />
              <div className="flex flex-wrap gap-2 mt-3">
                {editing.images.map((src) => (
                  <div key={src} className="relative">
                    <img src={src} alt="" className="w-16 h-16 rounded object-cover" />
                    <button type="button" onClick={() => setEditing({ ...editing, images: editing.images.filter((i) => i !== src) })} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 font-body text-sm text-foreground"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2 font-body text-sm text-foreground"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Enabled</label>
            </div>
            <button disabled={busy} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-3 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
              {busy && <Loader2 size={16} className="animate-spin" />} Save product
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
