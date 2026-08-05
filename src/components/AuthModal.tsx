import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

type Mode = "login" | "signup" | "verify";

const AuthModal = () => {
  const { user, isAuthModalOpen, closeAuthModal, authNext, setGuest } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const cleanEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (user && isAuthModalOpen) closeAuthModal();
  }, [user, isAuthModalOpen, closeAuthModal]);

  const finish = () => {
    closeAuthModal();
    if (authNext) window.location.assign(authNext);
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setBusy(false);
    if (error) return toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password" : error.message);
    toast.success("Welcome back");
    finish();
  };

  const signup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters for your password");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.session) return finish();
    setMode("verify");
    toast.success("A 6-digit verification code was sent to your email");
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: code, type: "signup" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Email verified");
    finish();
  };

  const resend = async () => {
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: cleanEmail, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("A new code was sent");
  };

  const field = "w-full h-11 rounded-md border border-border bg-muted pl-10 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-none h-[100dvh] w-screen rounded-none border-0 p-0 overflow-y-auto bg-background sm:rounded-none">
        <div className="min-h-full grid lg:grid-cols-2">
          <div className="hidden lg:flex bg-secondary p-12 items-center justify-center border-r border-border">
            <div className="max-w-md">
              <img src={logo} alt="eKharayo" className="h-16 w-auto mb-8" />
              <p className="font-display text-4xl font-bold text-foreground">A trusted marketplace for quality products.</p>
              <p className="mt-4 text-muted-foreground">Sign in for secure checkout, order history, wishlist and account services.</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-5 sm:p-10">
            <div className="w-full max-w-md">
              <img src={logo} alt="eKharayo" className="h-12 w-auto mx-auto mb-6 lg:hidden" />
              <DialogTitle className="font-display text-3xl text-center">
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Verify your email"}
              </DialogTitle>
              <DialogDescription className="text-center mt-2 mb-7">
                {mode === "verify" ? `Enter the 6-digit code sent to ${cleanEmail}.` : "Secure access to your eKharayo account."}
              </DialogDescription>

              {mode === "login" && <form onSubmit={login} className="space-y-4">
                <div className="relative"><Mail className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} /></div>
                <div className="relative"><Lock className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={field} /><button type="button" aria-label="Show password" onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-muted-foreground">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                <Button className="w-full h-11" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Lock />} Sign in</Button>
                <Button type="button" variant="link" className="w-full" onClick={() => setMode("signup")}>Create a new account</Button>
              </form>}

              {mode === "signup" && <form onSubmit={signup} className="space-y-4">
                <div className="relative"><User className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={field} /></div>
                <div className="relative"><Mail className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} /></div>
                <div className="relative"><Lock className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" className={field} /></div>
                <div className="relative"><Lock className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className={field} /></div>
                <Button className="w-full h-11" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <User />} Create account</Button>
                <Button type="button" variant="link" className="w-full" onClick={() => setMode("login")}>Already have an account? Sign in</Button>
              </form>}

              {mode === "verify" && <form onSubmit={verify} className="space-y-4">
                <input required inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="w-full h-14 rounded-md border border-border bg-muted text-center text-2xl text-foreground tracking-[0.35em] outline-none focus:ring-2 focus:ring-ring" />
                <Button className="w-full h-11" disabled={busy || code.length !== 6}>{busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Verify and continue</Button>
                <Button type="button" variant="link" className="w-full" onClick={resend} disabled={busy}>Resend code</Button>
              </form>}

              <div className="flex items-center gap-3 my-6"><span className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">OR</span><span className="h-px flex-1 bg-border" /></div>
              <Button type="button" variant="outline" className="w-full h-11" onClick={() => { setGuest(true); closeAuthModal(); }}>Continue as Guest</Button>
              <p className="text-xs text-muted-foreground text-center mt-3">Guest browsing is available. Sign in is required for checkout and account features.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;