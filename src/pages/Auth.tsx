import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, ShieldCheck, ArrowLeft, Loader2, Eye, EyeOff, Lock, User as UserIcon, Leaf, Truck, BadgeCheck } from "lucide-react";
import logo from "@/assets/logo.png";

const OTP_TTL = 600; // 10 minutes

type Mode = "login" | "signup" | "forgot" | "otp" | "reset";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [otpType, setOtpType] = useState<"signup" | "recovery">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, isAdmin, loading } = useAuth();

  const next = params.get("next");

  // Handle email links: password-recovery links land here and Supabase fires PASSWORD_RECOVERY
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setOtpType("recovery");
        setMode("reset");
      }
    });
    // Fallback in case the hash is still visible on mount
    if (window.location.hash.includes("type=recovery")) {
      setOtpType("recovery");
      setMode("reset");
    }
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      // A verified recovery session must set a new password first
      if (mode === "reset") return;
      navigate(isAdmin ? "/admin" : next || "/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate, next, mode]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const cleanEmail = email.trim().toLowerCase();

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth` },
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
    setOtpType("signup");
    setMode("otp");
    setSecondsLeft(OTP_TTL);
    toast.success("We sent a 6-digit verification code to your email");
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setBusy(false);
    if (!error) return toast.success("Welcome back");
    if (error.message.toLowerCase().includes("email not confirmed")) {
      // Always take the user to the OTP screen — they already hold a valid code.
      // Resend is best-effort (it can be rate-limited right after signup).
      setOtpType("signup");
      setMode("otp");
      setSecondsLeft(OTP_TTL);
      const { error: rErr } = await supabase.auth.resend({ type: "signup", email: cleanEmail });
      if (rErr) return toast.success("Please verify your email — use the code we already sent you");
      return toast.success("Please verify your email — we sent you a new code");
    }
    toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password" : error.message);
  };

  const forgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setOtpType("recovery");
    setMode("otp");
    setSecondsLeft(OTP_TTL);
    toast.success("We sent a 6-digit reset code to your email");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: code.trim(), type: otpType });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (otpType === "recovery") {
      setMode("reset");
      toast.success("Code verified — choose a new password");
    } else {
      toast.success("Email verified — welcome to eKharayo");
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated — you're signed in");
    setMode("login"); // triggers the signed-in redirect above
  };

  const resend = async () => {
    setBusy(true);
    const { error } =
      otpType === "signup"
        ? await supabase.auth.resend({ type: "signup", email: cleanEmail, options: { emailRedirectTo: `${window.location.origin}/auth` } })
        : await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${window.location.origin}/auth` });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSecondsLeft(OTP_TTL);
    toast.success("New code sent");
  };

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const field =
    "w-full border border-border rounded-lg pl-10 pr-4 py-3 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
  const btn =
    "w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-3.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60";

  const titles: Record<Mode, [string, string]> = {
    login: ["Welcome back", "Sign in with your email and password."],
    signup: ["Create your account", "Join eKharayo and shop fresh agro products."],
    forgot: ["Reset your password", "We'll email you a 6-digit reset code."],
    otp: ["Enter your code", `Code sent to ${cleanEmail}. It expires in 10 minutes.`],
    reset: ["Choose a new password", "Your new password must be at least 6 characters."],
  };
  const [title, subtitle] = titles[mode];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(hsl(var(--primary)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.3)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative max-w-md space-y-8">
          <img src={logo} alt="eKharayo" className="h-16 w-auto" />
          <div>
            <h2 className="font-display text-4xl font-bold text-foreground leading-tight">
              Fresh from the farm, <span className="text-primary">straight to your door.</span>
            </h2>
            <p className="font-body text-muted-foreground mt-3">
              The official digital marketplace of Great Sagarmatha Trade Pvt. Ltd. — quality agro products from Nepal
              and trusted international suppliers.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              { icon: Leaf, text: "Farm-fresh dairy, meat and crop products" },
              { icon: Truck, text: "Reliable home delivery across Nepal" },
              { icon: BadgeCheck, text: "Secure accounts with verified email" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3 font-body text-sm text-foreground">
                <span className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <f.icon size={17} className="text-primary" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-body text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="bg-card border border-border rounded-2xl shadow-xl shadow-primary/5 p-8">
            <img src={logo} alt="eKharayo" className="h-12 w-auto mx-auto mb-6 lg:hidden" />
            <h1 className="font-display text-2xl font-bold text-foreground text-center mb-1">{title}</h1>
            <p className="font-body text-sm text-muted-foreground text-center mb-7">{subtitle}</p>

            {mode === "login" && (
              <form onSubmit={login} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={field}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button disabled={busy} className={btn}>
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Sign in
                </button>
                <div className="flex items-center justify-between font-body text-xs text-muted-foreground">
                  <button type="button" onClick={() => setMode("forgot")} className="hover:text-primary transition-colors">
                    Forgot password?
                  </button>
                  <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">
                    Create account
                  </button>
                </div>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={signUp} className="space-y-4">
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={field} />
                </div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password (min 6 characters)"
                    className={field}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    className={field}
                  />
                </div>
                <button disabled={busy} className={btn}>
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />} Create account
                </button>
                <p className="font-body text-xs text-muted-foreground text-center">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={forgot} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} />
                </div>
                <button disabled={busy} className={btn}>
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />} Send reset code
                </button>
                <p className="font-body text-xs text-muted-foreground text-center">
                  <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline">
                    Back to sign in
                  </button>
                </p>
              </form>
            )}

            {mode === "otp" && (
              <form onSubmit={verify} className="space-y-4">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full border border-border rounded-lg px-4 py-3 font-body text-center text-2xl tracking-[0.5em] bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                />
                <button disabled={busy || code.length < 6} className={btn}>
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Verify & continue
                </button>
                <div className="flex items-center justify-between font-body text-xs text-muted-foreground">
                  <button type="button" onClick={() => setMode(otpType === "signup" ? "signup" : "forgot")} className="hover:text-primary transition-colors">
                    Change email
                  </button>
                  {secondsLeft > 0 ? (
                    <span>Code expires in {mmss}</span>
                  ) : (
                    <button type="button" onClick={resend} className="text-primary hover:underline">
                      Resend code
                    </button>
                  )}
                </div>
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={resetPassword} className="space-y-4">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className={field}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button disabled={busy} className={btn}>
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Update password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
