import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Category { id: string; name: string; slug: string; description: string | null; image_url: string | null; sort_order: number }
const empty = { name: "", slug: "", description: "", image_url: "", sort_order: 0 };

const AdminCategories = () => {
  const [rows, setRows] = useState<Category[]>([]);
  const [editing, setEditing] = useState<null | (typeof empty & { id?: string })>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setRows((data as unknown as Category[]) ?? []);
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
      image_url: editing.image_url || null,
      sort_order: Number(editing.sort_order),
    };
    const { error } = editing.id
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Category saved");
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const field = "w-full border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Categories</h1>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-glow transition-colors"><Plus size={16} /> Add</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-xl p-5">
            {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-28 object-cover rounded-lg mb-3" />}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display font-bold text-foreground">{c.name}</p>
                <p className="font-body text-xs text-muted-foreground">{c.description}</p>
              </div>
              <div className="flex">
                <button onClick={() => setEditing({ ...c, description: c.description ?? "", image_url: c.image_url ?? "" })} className="p-2 text-muted-foreground hover:text-primary"><Pencil size={15} /></button>
                <button onClick={() => del(c.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">{editing.id ? "Edit category" : "New category"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <input required placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={field} />
            <textarea rows={2} placeholder="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={`${field} resize-none`} />
            <input type="number" placeholder="Sort order" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className={field} />
            <div>
              <label className="font-body text-sm text-foreground block mb-2">Category image</label>
              <input type="file" accept="image/*" className="font-body text-sm text-muted-foreground" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                try { setEditing({ ...editing, image_url: await uploadMedia(f, "categories") }); }
                catch (err) { toast.error((err as Error).message); }
                setBusy(false);
              }} />
              {editing.image_url && <img src={editing.image_url} alt="" className="w-20 h-20 object-cover rounded mt-3" />}
            </div>
            <button disabled={busy} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-3 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60">
              {busy && <Loader2 size={16} className="animate-spin" />} Save category
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
