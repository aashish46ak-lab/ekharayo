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
  const { user, isAuthModalOpen, closeAuthModal, authNext, setGuest } = useAuth();
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

  const finish = () => {
    closeAuthModal();
    if (authNext) window.location.assign(authNext);
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        // Always go to the OTP screen — the user already holds a valid code.
        setOtpType("signup");
        setMode("verify");
        const { error: rErr } = await supabase.auth.resend({
          type: "signup",
          email: cleanEmail,
          options: {},
        });
        if (rErr) return toast.error(`Email delivery failed: ${rErr.message}`);
        return toast.success("Please verify your email — we sent you a new code");
      }
      return toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password" : error.message);
    }
    toast.success("Welcome back");
    finish();
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
    finish();
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) return toast.error("Use at least 6 characters for your password");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    finish();
  };

  const resend = async () => {
    setBusy(true);
    const { error } =
      otpType === "signup"
        ? await supabase.auth.resend({ type: "signup", email: cleanEmail })
        : await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${window.location.origin}/auth` });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("A new code was sent");
  };

  const field = "w-full h-11 rounded-md border border-border bg-muted pl-10 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  const titles: Record<Mode, [string, string]> = {
    login: ["Welcome back", "Secure access to your eKharayo account."],
    signup: ["Create account", "Secure access to your eKharayo account."],
    verify: otpType === "signup" ? ["Verify your email", `Enter the 6-digit code sent to ${cleanEmail}.`] : ["Reset code sent", `Enter the 6-digit code sent to ${cleanEmail}.`],
    forgot: ["Reset your password", "We'll email you a 6-digit reset code."],
    reset: ["Choose a new password", "Your new password must be at least 6 characters."],
  };

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
              <DialogTitle className="font-display text-3xl text-center">{titles[mode][0]}</DialogTitle>
              <DialogDescription className="text-center mt-2 mb-7">{titles[mode][1]}</DialogDescription>

              {mode === "login" && <form onSubmit={login} className="space-y-4">
                <div className="relative"><Mail className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} /></div>
                <div className="relative"><Lock className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={field} /><button type="button" aria-label="Show password" onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-muted-foreground">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                <Button className="w-full h-11" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Lock />} Sign in</Button>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <button type="button" onClick={() => setMode("forgot")} className="hover:text-primary transition-colors">Forgot password?</button>
                  <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">Create a new account</button>
                </div>
              </form>}

              {mode === "signup" && <form onSubmit={signup} className="space-y-4">
                <div className="relative"><User className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={field} /></div>
                <div className="relative"><Mail className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} /></div>
                <div className="relative"><Lock className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ characters)" className={field} /></div>
                <div className="relative"><Lock className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className={field} /></div>
                <Button className="w-full h-11" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <User />} Create account</Button>
                <Button type="button" variant="link" className="w-full" onClick={() => setMode("login")}>Already have an account? Sign in</Button>
              </form>}

              {mode === "forgot" && <form onSubmit={forgot} className="space-y-4">
                <div className="relative"><Mail className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} /></div>
                <Button className="w-full h-11" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Mail />} Send reset code</Button>
                <Button type="button" variant="link" className="w-full" onClick={() => setMode("login")}>Back to sign in</Button>
              </form>}

              {mode === "verify" && <form onSubmit={verify} className="space-y-4">
                <input required inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="w-full h-14 rounded-md border border-border bg-muted text-center text-2xl text-foreground tracking-[0.35em] outline-none focus:ring-2 focus:ring-ring" />
                <Button className="w-full h-11" disabled={busy || code.length !== 6}>{busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Verify and continue</Button>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <button type="button" onClick={() => setMode(otpType === "signup" ? "signup" : "forgot")} className="hover:text-primary transition-colors">Change email</button>
                  <button type="button" onClick={resend} disabled={busy} className="text-primary hover:underline">Resend code</button>
                </div>
              </form>}

              {mode === "reset" && <form onSubmit={resetPassword} className="space-y-4">
                <div className="relative"><Lock className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input required type={show ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (6+ characters)" className={field} /><button type="button" aria-label="Show password" onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-muted-foreground">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                <Button className="w-full h-11" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Update password</Button>
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
