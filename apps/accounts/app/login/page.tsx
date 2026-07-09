"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { appUrl } from "@tirbeo/utils";
import { motion } from "motion/react";
import { Chrome, Github, Eye, EyeOff, ArrowLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StepItem({ number, text, active, done }: { number: number; text: string; active?: boolean; done?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active ? "bg-white text-black border border-white" :
      done ? "bg-white/10 text-white/80" :
      "bg-brand-gray text-white/40 border-none"
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        active ? "bg-black text-white" :
        done ? "bg-white/20 text-white" :
        "bg-white/10 text-white/40"
      }`}>
        {done ? "✓" : String(number).padStart(2, "0")}
      </div>
      <span className={`text-sm font-medium ${active ? "" : done ? "text-white/70" : "text-white/40"}`}>{text}</span>
    </div>
  );
}

function SocialButton({ icon: Icon, label, onClick, disabled }: { icon: React.ElementType; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex items-center justify-center gap-2 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
      <Icon className="w-5 h-5" />
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
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input
          type={isPwd ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 outline-none text-sm"
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {isPwd && <p className="text-xs text-white/30">Requires at least 8 symbols.</p>}
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
          className="w-12 h-14 rounded-xl border border-white/10 bg-white/5 text-white text-xl font-medium text-center outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

type AuthStep = "login" | "signup" | "otp-login" | "otp-signup";
type FieldErrors = { email?: string; password?: string };
type SignupPhase = 0 | 1 | 2 | 3;

function LoginForm({ onPhaseChange }: { onPhaseChange?: (phase: SignupPhase, isSignup: boolean) => void }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AuthStep>("login");
  const [signupPhase, setSignupPhase] = useState<SignupPhase>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [phone, setPhone] = useState("");
  const [whoYouAre, setWhoYouAre] = useState("");
  const [findUs, setFindUs] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const submittedRef = useRef(false);

  const isSignUp = step === "signup" || step === "otp-signup";
  const isOtpStep = step === "otp-login" || step === "otp-signup";

  const redirectTo = searchParams.get("redirect") || appUrl("dashboard");

  useEffect(() => {
    onPhaseChange?.(signupPhase, isSignUp);
  }, [signupPhase, isSignUp, onPhaseChange]);

  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};
    if (!email || !EMAIL_RE.test(email)) errors.email = "Enter a valid email address";
    if (!isOtpStep && !password || password.length < 8) errors.password = "Min 8 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password, isOtpStep]);

  const apiFetch = useCallback(async (path: string, body: Record<string, unknown>, opts?: { noCreds?: boolean }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: opts?.noCreds ? undefined : "include",
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === 'AbortError') throw new Error('Request timed out. Check your connection.');
      throw new Error(err?.message || 'Network request failed');
    }
  }, []);

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${API}/auth/google`;
  }, []);

  const handleGithubLogin = useCallback(() => {
    window.location.href = `${API}/auth/github`;
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
        if (res.ok) {
          setSignupPhase(2);
          setStep("signup");
          setOtpCode("");
          return;
        }
        setError(await res.text() || "Signup failed");
      } else if (step === "login") {
        const res = await apiFetch("/api/auth/login", { email, password });
        if (res.ok) { window.location.href = redirectTo; return; }
        setError(await res.text() || "Invalid credentials");
      } else {
        const res = await apiFetch("/api/auth/signup-otp/request", { email }, { noCreds: true });
        if (res.ok) { setStep("otp-signup"); setOtpCode(""); return; }
        setError(await res.text() || "Failed to send code");
      }
    } catch (err: any) {
      setError(err?.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
      submittedRef.current = false;
    }
  }, [email, password, firstName, lastName, otpCode, step, signupPhase, redirectTo, validate, apiFetch]);

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
    } catch (err: any) {
      setError(err?.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
      submittedRef.current = false;
    }
  }, [email, apiFetch]);

  const handleSaveProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: [firstName, lastName].filter(Boolean).join(" ").trim() || undefined,
          phoneNumber: phone || undefined,
          occupation: occupation || whoYouAre || undefined,
        }),
      });
      if (res.ok) {
        setSignupPhase(3);
      } else {
        setError(await res.text() || "Failed to save profile");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, phone, occupation, whoYouAre, API]);

  const handleCompleteSetup = useCallback(() => {
    window.location.href = redirectTo;
  }, [redirectTo]);

  const switchMode = () => {
    const newStep = isSignUp ? "login" : "signup";
    setStep(newStep);
    setSignupPhase(isSignUp ? 0 as SignupPhase : 1);
    setError(null);
    setFieldErrors({});
  };

  const isLoginMode = step === "login" || step === "otp-login";

  return (
    <motion.div
      key={isOtpStep ? "otp" : isSignUp ? `signup-phase-${signupPhase}` : "login"}
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
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {signupPhase === 2 && (
          <button
            type="button"
            onClick={() => { setStep("otp-signup"); setSignupPhase(1); }}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-medium tracking-tight">
            {isOtpStep ? "Check Your Email" :
             signupPhase === 2 ? "Configure Your Studio" :
             signupPhase === 3 ? "Finalize Your Profile" :
             isSignUp ? "Create New Profile" : "Welcome Back"}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {isOtpStep ? `We sent a code to ${email}` :
             signupPhase === 2 ? "Tell us a bit about yourself." :
             signupPhase === 3 ? "You're all set. Ready to explore." :
             isSignUp ? "Input your basic details to begin the journey." :
             "Sign in to your account to continue."}
          </p>
        </div>
      </div>

      {!isOtpStep && signupPhase < 2 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={Chrome} label="Google" onClick={handleGoogleLogin} disabled={loading} />
            <SocialButton icon={Github} label="Github" onClick={handleGithubLogin} disabled={loading} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {isOtpStep ? (
          <div className="space-y-6 pt-4">
            <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
            <p className="text-center text-sm text-white/30">
              Didn&apos;t receive the code?{" "}
              <button type="button" onClick={handleOtpLogin} className="text-white/60 underline hover:text-white/80">
                Resend
              </button>
            </p>
          </div>
        ) : signupPhase === 2 ? (
          <div className="space-y-4">
            <InputGroup label="Occupation" placeholder="e.g. Designer, Developer" type="text" value={occupation} onChange={setOccupation} />
            <InputGroup label="Phone Number" placeholder="+977 98XXXXXXXX" type="tel" value={phone} onChange={setPhone} />
            <InputGroup label="Who you are" placeholder="A short bio about yourself" type="text" value={whoYouAre} onChange={setWhoYouAre} />
            <InputGroup label="Where did you find us?" placeholder="Google, Friend, Social Media..." type="text" value={findUs} onChange={setFindUs} />
          </div>
        ) : signupPhase === 3 ? (
          <div className="space-y-6 pt-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-lg font-medium">Profile Complete</p>
              <p className="text-white/40 text-sm mt-1">
                {firstName} {lastName} &middot; {occupation || "Member"}
              </p>
            </div>
            <div className="flex justify-center gap-2 text-xs text-white/30">
              {phone && <span className="bg-white/5 px-2 py-1 rounded">{phone}</span>}
              {findUs && <span className="bg-white/5 px-2 py-1 rounded">Found via: {findUs}</span>}
            </div>
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
              placeholder="8+ characters"
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
            className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                Verifying...
              </span>
            ) : "Verify & Continue"}
          </button>
        )}

        {signupPhase === 2 && (
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        )}

        {signupPhase === 3 && (
          <button
            type="button"
            onClick={handleCompleteSetup}
            className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4"
          >
            Go to Dashboard
          </button>
        )}

        {!isOtpStep && signupPhase < 2 && (
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                {isSignUp ? "Sending..." : "Signing in..."}
              </span>
            ) : isSignUp ? "Send Verification Code" : "Sign In"}
          </button>
        )}

        {!isOtpStep && signupPhase < 2 && (
          <button
            type="button"
            onClick={handleOtpLogin}
            disabled={loading}
            className="w-full h-12 glass rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all disabled:opacity-50"
          >
            Send one-time code
          </button>
        )}
      </form>

      {!isOtpStep && signupPhase < 2 && (
        <p className="text-center text-sm text-white/40">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button type="button" onClick={switchMode} className="text-white underline hover:text-white/80 transition-colors">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      )}
    </motion.div>
  );
}

export default function LoginPage() {
  const [signupPhase, setSignupPhase] = useState<SignupPhase>(0);
  const [showSteps, setShowSteps] = useState(false);

  const handlePhaseChange = useCallback((phase: SignupPhase, isSignup: boolean) => {
    setSignupPhase(phase);
    setShowSteps(isSignup);
  }, []);

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 transition-all duration-500 lg:h-screen lg:overflow-hidden">
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-xs space-y-8"
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap">
              {showSteps ? "Join Tirbeo" : "Welcome Back"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              {showSteps
                ? "Follow these 3 quick phases to activate your space."
                : "Sign in to your account to continue."}
            </p>
          </motion.div>
          {showSteps && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-3">
              <StepItem number={1} text="Register your identity" active={signupPhase === 1} done={signupPhase > 1} />
              <StepItem number={2} text="Configure your studio" active={signupPhase === 2} done={signupPhase > 2} />
              <StepItem number={3} text="Finalize your profile" active={signupPhase === 3} />
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-xl">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          }>
            <LoginForm onPhaseChange={handlePhaseChange} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
