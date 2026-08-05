import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldAlert, ShieldCheck, Search, Loader2 } from "lucide-react";
import { AppRole, STAFF_ROLES } from "@/hooks/useAuth";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: AppRole;
}

const AdminStaff = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles((p.data as Profile[]) ?? []);
    setUserRoles((r.data as UserRole[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (userId: string, role: AppRole) => {
    const hasRole = userRoles.find((r) => r.user_id === userId && r.role === role);
    if (hasRole) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) return toast.error(error.message);
      toast.success("Role removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
      toast.success("Role assigned");
    }
    load();
  };

  const visible = profiles.filter((p) => `${p.email} ${p.full_name}`.toLowerCase().includes(q.toLowerCase()));

  const field = "border border-border rounded-lg px-3 py-2.5 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Staff Management</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className={`${field} pl-9 w-64`} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={26} /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="p-4">User</th>
                <th className="p-4">Staff Roles</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const currentRoles = userRoles.filter((r) => r.user_id === p.id).map((r) => r.role);
                const isStaff = currentRoles.some((r) => STAFF_ROLES.includes(r));

                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{p.full_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {currentRoles.length > 0 ? (
                          currentRoles.map((r) => (
                            <span key={r} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {r.replace("_", " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs italic">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {STAFF_ROLES.map((role) => {
                          const active = currentRoles.includes(role);
                          return (
                            <button
                              key={role}
                              onClick={() => toggleRole(p.id, role)}
                              title={`Toggle ${role} role`}
                              className={`p-2 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/20"}`}
                            >
                              {role === "super_admin" ? <ShieldAlert size={15} /> : role === "admin" ? <ShieldCheck size={15} /> : <Shield size={15} />}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
