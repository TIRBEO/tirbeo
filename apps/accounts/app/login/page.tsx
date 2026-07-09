"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { appUrl } from "@tirbeo/utils";
import { motion } from "motion/react";
import { Chrome, Github, Eye, EyeOff, ArrowLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api-tirbeo.vercel.app";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />;
}

function StepItem({ number, text, active }: { number: number; text: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? "bg-gradient-to-r from-[#F25604] to-[#F97316] text-white border-none" : "glass text-[#EAF3F3]"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-white text-[#F25604]" : "bg-[rgba(255,255,255,0.1)] text-[#94A3B8]"}`}>
        {String(number).padStart(2, "0")}
      </div>
      <span className={`text-sm font-medium ${active ? "" : "text-[#CBD5E1]"}`}>{text}</span>
    </div>
  );
}

function SocialButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center justify-center gap-2 glass rounded-xl px-4 py-3 text-sm font-medium text-[#EAF3F3] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 hover:border-[#F97316]/30">
      <Icon className="w-5 h-5 text-[#F97316]" />
      <span>{label}</span>
    </button>
  );
}

function InputGroup({ label, placeholder, type, value, onChange, error }: {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#CBD5E1]">{label}</label>
      <div className="relative">
        <input
          type={isPwd ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[rgba(255,255,255,0.05)] border border-white/[0.08] rounded-xl h-11 px-4 text-[#EAF3F3] placeholder:text-[#94A3B8]/50 focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]/50 outline-none text-sm transition-all"
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#EAF3F3]">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {isPwd && <p className="text-xs text-[#94A3B8]/60">Requires at least 8 symbols.</p>}
      {error && <p className="text-xs text-red-400/80">{error}</p>}
    </div>
  );
}

function OtpInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const newVal = value.split("");
    newVal[index] = char.slice(-1);
    const joined = newVal.join("");
    onChange(joined);
    if (char && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(paste);
    const nextIndex = Math.min(paste.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  return (
    <div className="flex gap-3 justify-center w-full" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-12 h-14 rounded-xl border border-white/[0.12] bg-[rgba(255,255,255,0.05)] text-[#EAF3F3] text-xl font-medium text-center outline-none focus:border-[#F97316]/50 focus:ring-2 focus:ring-[#F97316]/20 transition-all"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

type AuthStep = "login" | "signup" | "otp-login" | "otp-signup";
type FieldErrors = { email?: string; password?: string };

function LoginForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const submittedRef = useRef(false);

  const redirectTo = searchParams.get("redirect") || appUrl("dashboard");
  const isOtpStep = step === "otp-login" || step === "otp-signup";
  const isSignUp = step === "signup" || step === "otp-signup";

  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};
    if (!email || !EMAIL_RE.test(email)) errors.email = "Enter a valid email address";
    if (!isOtpStep && !isSignUp && (!password || password.length < 8)) errors.password = "Min 8 characters";
    if (isSignUp && !isOtpStep && (!password || password.length < 8)) errors.password = "Min 8 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password, isOtpStep, isSignUp]);

  const apiFetch = useCallback(async (path: string, body: Record<string, unknown>, opts?: { noCreds?: boolean }) => {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: opts?.noCreds ? undefined : "include",
      body: JSON.stringify(body),
    });
    return res;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittedRef.current) return;
    if (!validate()) return;
    submittedRef.current = true;
    setError(null);
    setLoading(true);
    try {
      if (step === "otp-login") {
        const res = await apiFetch("/api/auth/login-otp/verify", { email, otpCode });
        if (res.ok) { window.location.href = redirectTo; return; }
        setError(await res.text() || "Invalid code");
      } else if (step === "otp-signup") {
        const name = [firstName, lastName].filter(Boolean).join(" ").trim() || email.split("@")[0];
        const res = await apiFetch("/api/auth/signup", { email, password, name, otpCode });
        if (res.ok) { window.location.href = redirectTo; return; }
        setError(await res.text() || "Signup failed");
      } else if (step === "signup") {
        const res = await apiFetch("/api/auth/signup-otp/request", { email }, { noCreds: true });
        if (res.ok) { setStep("otp-signup"); setOtpCode(""); return; }
        setError(await res.text() || "Failed to send code");
      } else {
        const res = await apiFetch("/api/auth/login", { email, password });
        if (res.ok) { window.location.href = redirectTo; return; }
        setError(await res.text() || "Invalid credentials");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
      submittedRef.current = false;
    }
  }, [email, password, firstName, lastName, otpCode, step, redirectTo, validate, apiFetch]);

  const handleOtpLogin = useCallback(async () => {
    if (submittedRef.current) return;
    if (!EMAIL_RE.test(email)) { setFieldErrors({ email: "Enter a valid email address" }); return; }
    submittedRef.current = true;
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/login-otp/request", { email }, { noCreds: true });
      if (res.ok) { setStep("otp-login"); setOtpCode(""); return; }
      setError(await res.text() || "Failed to send code");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
      submittedRef.current = false;
    }
  }, [email, apiFetch]);

  const handleGoogleLogin = useCallback(async () => {
    window.location.href = `${API}/api/auth/google`;
  }, []);

  const otpButtonLabel = step === "otp-login" ? "Verify & Sign In" : "Verify & Create Account";
  const submitButtonLabel = step === "signup" ? "Send Verification Code" : "Sign In";

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto space-y-8 lg:space-y-6 sm:space-y-10"
    >
      <div className="flex items-center gap-4">
        {isOtpStep && (
          <button
            type="button"
            onClick={() => { setStep(isSignUp ? "signup" : "login"); setOtpCode(""); setError(null); }}
            className="text-[#94A3B8] hover:text-[#EAF3F3] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isOtpStep ? "Check Your Email" : isSignUp ? <span className="gradient-text">Create Account</span> : <span className="gradient-text">Welcome Back</span>}
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {isOtpStep
              ? `We sent a code to ${email}`
              : isSignUp
                ? "Input your basic details to begin the journey."
                : "Sign in to your account to continue."}
          </p>
        </div>
      </div>

      {!isOtpStep && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={Chrome} label="Google" onClick={handleGoogleLogin} />
            <SocialButton icon={Github} label="Github" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {isOtpStep ? (
          <div className="space-y-6 pt-4">
            <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
            <p className="text-center text-sm text-[#94A3B8]/60">
              Didn&apos;t receive the code?{" "}
              <button type="button" onClick={handleOtpLogin} className="text-[#F97316] underline hover:text-[#F25604]">
                Resend
              </button>
            </p>
          </div>
        ) : (
          <>
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" placeholder="John" type="text" value={firstName} onChange={setFirstName} />
                <InputGroup label="Last Name" placeholder="Doe" type="text" value={lastName} onChange={setLastName} />
              </div>
            )}
            <InputGroup
              label="Email"
              placeholder="hello@example.com"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); setFieldErrors((p) => ({ ...p, email: undefined })); }}
              error={fieldErrors.email}
            />
            <InputGroup
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: undefined })); }}
              error={fieldErrors.password}
            />
          </>
        )}

        {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        {isOtpStep && (
          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full h-14 bg-gradient-to-r from-[#F25604] to-[#F97316] text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-4 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                Verifying...
              </span>
            ) : otpButtonLabel}
          </button>
        )}

        {!isOtpStep && (
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#F25604] to-[#F97316] text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-4 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                {isSignUp ? "Sending..." : "Signing in..."}
              </span>
            ) : submitButtonLabel}
          </button>
        )}

        {!isOtpStep && (
          <button
            type="button"
            onClick={handleOtpLogin}
            disabled={loading}
            className="w-full h-12 glass rounded-xl text-sm font-medium text-[#CBD5E1] hover:text-[#EAF3F3] transition-all disabled:opacity-50"
          >
            Send one-time code
          </button>
        )}
      </form>

      {!isOtpStep && (
        <p className="text-center text-sm text-[#94A3B8]">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button type="button" onClick={() => { setStep(isSignUp ? "login" : "signup"); setError(null); setFieldErrors({}); }} className="text-[#F97316] underline hover:text-[#F25604] transition-colors">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      )}
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-[#F25604]/40 relative overflow-hidden">
      {/* Gradient mesh bg */}
      <div className="fixed inset-0 bg-mesh opacity-60 pointer-events-none" />

      {/* Glow orbs */}
      <GlowOrb className="w-[40%] h-[40%] top-[-15%] right-[-10%] bg-[#7A3EF2]/20" />
      <GlowOrb className="w-[35%] h-[35%] bottom-[-15%] left-[-10%] bg-[#F25604]/15" />
      <GlowOrb className="w-[25%] h-[25%] top-[30%] left-[30%] bg-[#0A2472]/20" />

      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%] z-10">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-xs space-y-8"
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <h2 className="text-4xl font-bold tracking-tight shimmer whitespace-nowrap">Join Tirbeo</h2>
            <p className="text-[#CBD5E1] text-sm leading-relaxed px-4 mt-2">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-3">
            <StepItem number={1} text="Register your identity" active />
            <StepItem number={2} text="Configure your studio" />
            <StepItem number={3} text="Finalize your profile" />
          </motion.div>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden relative z-10">
        <div className="w-full max-w-xl">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-[#F25604]/20 border-t-[#F97316] rounded-full animate-spin" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
