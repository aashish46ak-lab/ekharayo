import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

type Mode = "login" | "signup" | "verify" | "forgot" | "reset";

const AuthModal = () => {
  const { user, isAuthModalOpen, closeAuthModal, authNext, setGuest, refreshRoles } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [otpType, setOtpType] = useState<"signup" | "recovery">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const cleanEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (user && isAuthModalOpen) closeAuthModal();
  }, [user, isAuthModalOpen, closeAuthModal]);

  const finish = async () => {
    closeAuthModal();
    const roles = await refreshRoles();
    const staff = ["super_admin", "admin", "manager", "staff"];
    const isStaff = roles.some((r) => staff.includes(r));
    if (authNext) {
      window.location.assign(authNext);
      return;
    }
    if (isStaff) {
      window.location.assign("/admin");
      return;
    }
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setOtpType("signup");
        setMode("verify");
        const { error: rErr } = await supabase.auth.resend({ type: "signup", email: cleanEmail });
        if (rErr) return toast.error(`Could not resend: ${rErr.message}`);
        return toast.success("Please verify your email — we sent you a new code");
      }
      return toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password" : error.message);
    }
    toast.success("Welcome back");
    await finish();
  };

  const signup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return toast.error("Use at least 6 characters for your password");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: name.trim() } },
    });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        toast.error("An account with this email already exists. Please sign in instead.");
        setMode("login");
        return;
      }
      return toast.error(error.message);
    }
    if (data.session) return finish();
    setOtpType("signup");
    setMode("verify");
    toast.success("A 6-digit verification code was sent to your email");
  };

  const forgot = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setOtpType("recovery");
    setMode("verify");
    toast.success("A 6-digit reset code was sent to your email");
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: code, type: otpType });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (otpType === "recovery") {
      setMode("reset");
      return toast.success("Code verified — choose a new password");
    }
    toast.success("Email verified");
    await finish();
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) return toast.error("Use at least 6 characters for your password");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    await finish();
  };

  const field =
    "w-full border border-border rounded-lg px-4 py-3 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

  const titles: Record<Mode, [string, string]> = {
    login: ["Welcome back", "Secure access to your eKharayo account."],
    signup: ["Create account", "Join eKharayo to order and track deliveries."],
    verify: otpType === "signup" ? ["Verify your email", `Enter the 6-digit code sent to ${cleanEmail}.`] : ["Reset code sent", `Enter the 6-digit code sent to ${cleanEmail}.`],
    forgot: ["Forgot password", "We will email you a reset code."],
    reset: ["New password", "Choose a strong password for your account."],
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <div className="flex flex-col items-center text-center mb-2">
          <img src={logo} alt="eKharayo" className="h-12 w-auto mb-3" />
          <DialogTitle className="font-display text-xl font-bold">{titles[mode][0]}</DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground mt-1">{titles[mode][1]}</DialogDescription>
        </div>

        <div className="space-y-4">
          {mode === "login" && (
            <form onSubmit={login} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} pl-10`} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input required type={show ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${field} pl-10 pr-10`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Forgot password?</button>
              <Button disabled={busy} className="w-full h-11">{busy ? <Loader2 className="animate-spin" size={16} /> : null} Sign in</Button>
              <p className="text-xs text-center text-muted-foreground">
                No account?{" "}
                <button type="button" onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">Sign up</button>
              </p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={signup} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={`${field} pl-10`} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} pl-10`} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input required type={show ? "text" : "password"} placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} className={`${field} pl-10 pr-10`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input required type={show ? "text" : "password"} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
              <Button disabled={busy} className="w-full h-11">{busy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} Create account</Button>
              <p className="text-xs text-center text-muted-foreground">
                Have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">Sign in</button>
              </p>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={verify} className="space-y-4">
              <input required inputMode="numeric" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} className={field} />
              <Button disabled={busy} className="w-full h-11">{busy ? <Loader2 className="animate-spin" size={16} /> : null} Verify</Button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={forgot} className="space-y-4">
              <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              <Button disabled={busy} className="w-full h-11">{busy ? <Loader2 className="animate-spin" size={16} /> : null} Send code</Button>
              <button type="button" onClick={() => setMode("login")} className="text-xs text-primary hover:underline w-full text-center">Back to sign in</button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={resetPassword} className="space-y-4">
              <input required type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={field} />
              <Button disabled={busy} className="w-full h-11">{busy ? <Loader2 className="animate-spin" size={16} /> : null} Update password</Button>
            </form>
          )}

          {(mode === "login" || mode === "signup") && (
            <>
              <Button type="button" variant="outline" className="w-full h-11" onClick={() => { setGuest(true); closeAuthModal(); }}>
                Continue as Guest
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Guest browsing is available. Sign in is required for checkout and account features.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
