import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

const OTP_TTL = 600; // 10 minutes

const Auth = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, isAdmin, loading } = useAuth();

  const next = params.get("next");

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : next || "/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate, next]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setStep("otp");
    setSecondsLeft(OTP_TTL);
    toast.success("We sent a 6-digit code to your email");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
  };

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-body text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="bg-card border border-border rounded-2xl shadow-xl shadow-primary/5 p-8">
          <img src={logo} alt="eKharayo" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-foreground text-center mb-1">
            {step === "email" ? "Sign in to eKharayo" : "Enter your code"}
          </h1>
          <p className="font-body text-sm text-muted-foreground text-center mb-7">
            {step === "email"
              ? "We'll email you a 6-digit verification code."
              : `Code sent to ${email}. It expires in 10 minutes.`}
          </p>

          {step === "email" ? (
            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground block mb-1">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-border rounded-lg pl-9 pr-4 py-3 font-body text-sm bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <button
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-3.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60"
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />} Send code
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground block mb-1">6-digit code</label>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full border border-border rounded-lg px-4 py-3 font-body text-center text-2xl tracking-[0.5em] bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              </div>
              <button
                disabled={busy || code.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold py-3.5 rounded-lg hover:bg-green-glow transition-colors disabled:opacity-60"
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Verify & continue
              </button>
              <div className="flex items-center justify-between font-body text-xs text-muted-foreground">
                <button type="button" onClick={() => setStep("email")} className="hover:text-primary transition-colors">
                  Change email
                </button>
                {secondsLeft > 0 ? (
                  <span>Code expires in {mmss}</span>
                ) : (
                  <button type="button" onClick={() => sendCode()} className="text-primary hover:underline">
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
