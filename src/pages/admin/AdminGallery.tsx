import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Row {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
}

const AdminGallery = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");

  const load = async () => {
    const { data } = await supabase.from("gallery_images" as never).select("*").order("sort_order");
    setRows((data as unknown as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadMedia(file, "gallery");
        const { error } = await supabase.from("gallery_images" as never).insert({
          image_url: url,
          caption: caption.trim() || null,
          sort_order: rows.length,
          is_active: true,
        } as never);
        if (error) throw error;
      }
      toast.success("Photo(s) added to gallery");
      setCaption("");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed — run gallery migration / check storage bucket");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("gallery_images" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Gallery</h1>
        <p className="font-body text-sm text-muted-foreground">Upload photos shown on the public Gallery page</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3 max-w-xl">
        <label className="font-body text-sm font-medium text-foreground flex items-center gap-2">
          <ImageIcon size={16} /> Add photos
        </label>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full border border-border rounded-lg px-3 py-2 font-body text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => onUpload(e.target.files)} className="font-body text-sm text-muted-foreground" />
        {busy && <p className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Uploading…</p>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={26} /></div>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">No gallery photos yet. Upload above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <img src={r.image_url} alt={r.caption || ""} className="w-full h-40 object-cover" />
              <div className="p-3 flex items-center justify-between gap-2">
                <p className="font-body text-xs text-muted-foreground truncate">{r.caption || "No caption"}</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
