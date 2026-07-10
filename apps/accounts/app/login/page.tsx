"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { appUrl } from "@tirbeo/utils";
import { motion } from "motion/react";
import { Chrome, Github, Eye, EyeOff, ArrowLeft, Check, Loader2, Shield, Mail, User, Briefcase, Phone, Globe, MessageSquare } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AVATAR_SEEDS = ["Felix", "Luna", "Milo", "Nala", "Oscar", "Pixel", "Ruby", "Sage", "Tango", "Ursa", "Vex", "Willow", "Xena", "Yuki", "Zara", "Aria", "Blaze", "Cleo", "Dexter", "Ember"];
const AVATAR_URLS = AVATAR_SEEDS.map(s => `https://api.dicebear.com/7.x/adventurer/svg?seed=${s}&backgroundColor=08150F,101c13,12271D,1a3326,275d46`);

function StepItem({ number, text, active, done }: { number: number; text: string; active?: boolean; done?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
      active ? "bg-accent-green/20 border border-accent-green/30" :
      done ? "bg-white/5 border border-white/5" :
      "bg-white/[0.02] border border-transparent"
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
        active ? "bg-gradient-to-br from-accent-green to-primary-green text-white shadow-lg shadow-accent-green/20" :
        done ? "bg-success/20 text-success" :
        "bg-white/5 text-white/30"
      }`}>
        {done ? <Check size={16} /> : number}
      </div>
      <div>
        <span className={`text-sm font-semibold block ${active ? "text-white" : done ? "text-white/60" : "text-white/30"}`}>{text}</span>
        <span className="text-xs text-white/20">{active ? "In progress" : done ? "Completed" : "Upcoming"}</span>
      </div>
    </div>
  );
}

function SocialButton({ icon: Icon, label, onClick, disabled }: { icon: React.ElementType; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm font-medium text-white hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group">
      <Icon className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
      <span>{label}</span>
    </button>
  );
}

function InputGroup({ label, placeholder, type, value, onChange, error, icon: Icon }: {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ElementType;
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-green transition-colors z-10">
            <Icon size={16} />
          </div>
        )}
        <input
          type={isPwd ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl h-12 px-4 ${Icon ? 'pl-11' : ''} text-white placeholder:text-white/20 focus:border-accent-green/40 focus:ring-2 focus:ring-accent-green/10 outline-none text-sm transition-all duration-200`}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {isPwd && <p className="text-xs text-white/20">Requires at least 8 characters.</p>}
      {error && <p className="text-xs text-error/80">{error}</p>}
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
          className="w-12 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white text-xl font-semibold text-center outline-none focus:border-accent-green/40 focus:ring-2 focus:ring-accent-green/10 transition-all duration-200"
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
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_URLS[0]);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
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
        if (res.ok) {
          try { const j = await res.json(); if (j.devCode) setDevCode(j.devCode); } catch {}
          setStep("otp-signup"); setOtpCode(""); return;
        }
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
        if (res.ok) {
          try { const j = await res.json(); if (j.devCode) setDevCode(j.devCode); } catch {}
          setStep("otp-login"); setOtpCode(""); return;
        }
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
          photoUrl: selectedAvatar,
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
  }, [firstName, lastName, phone, occupation, whoYouAre, selectedAvatar, API]);

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto space-y-8 lg:space-y-6 sm:space-y-10"
    >
      <div className="flex items-center gap-4">
        {isOtpStep && (
          <button
            type="button"
            onClick={() => { setStep(isSignUp ? "signup" : "login"); setOtpCode(""); setError(null); }}
            className="text-white/30 hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        {signupPhase === 2 && (
          <button
            type="button"
            onClick={() => { setStep("otp-signup"); setSignupPhase(1); }}
            className="text-white/30 hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isOtpStep ? "Check Your Email" :
             signupPhase === 2 ? "Configure Your Studio" :
             signupPhase === 3 ? "Finalize Your Profile" :
             isSignUp ? "Create New Profile" : "Welcome Back"}
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {isOtpStep ? `We sent a verification code to ${email}` :
             signupPhase === 2 ? "Tell us a bit about yourself." :
             signupPhase === 3 ? "You're all set. Ready to explore Tirbeo." :
             isSignUp ? "Input your basic details to begin the journey." :
             "Sign in to your account to continue."}
          </p>
        </div>
      </div>

      {!isOtpStep && signupPhase < 2 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={Chrome} label="Google" onClick={handleGoogleLogin} disabled={loading} />
            <SocialButton icon={Github} label="GitHub" onClick={handleGithubLogin} disabled={loading} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs font-medium text-white/20 uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {isOtpStep ? (
          <div className="space-y-6 pt-4">
            <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
            {devCode && (
              <div className="text-center p-4 rounded-2xl bg-accent-green/10 border border-accent-green/20">
                <p className="text-xs font-medium text-accent-green">Dev Mode — Your code: <span className="font-bold text-sm">{devCode}</span></p>
              </div>
            )}
            <p className="text-center text-sm text-white/30">
              Didn&apos;t receive the code?{" "}
              <button type="button" onClick={handleOtpLogin} className="text-accent-green/80 underline hover:text-accent-green transition-colors">
                Resend
              </button>
            </p>
          </div>
        ) : signupPhase === 2 ? (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-white/80 mb-3 block">Choose Your Avatar</label>
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_URLS.map((url, i) => (
                  <button key={i} type="button" onClick={() => setSelectedAvatar(url)}
                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                      selectedAvatar === url ? "border-accent-green ring-2 ring-accent-green/30 scale-110" : "border-white/[0.08] hover:border-white/20"
                    }`}>
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
            <InputGroup label="Occupation" placeholder="e.g. Designer, Developer" type="text" value={occupation} onChange={setOccupation} icon={Briefcase} />
            <InputGroup label="Phone Number" placeholder="+977 98XXXXXXXX" type="tel" value={phone} onChange={setPhone} icon={Phone} />
            <InputGroup label="Who you are" placeholder="A short bio about yourself" type="text" value={whoYouAre} onChange={setWhoYouAre} icon={MessageSquare} />
            <InputGroup label="Where did you find us?" placeholder="Google, Friend, Social Media..." type="text" value={findUs} onChange={setFindUs} icon={Globe} />
          </div>
        ) : signupPhase === 3 ? (
          <div className="space-y-6 pt-4 text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-accent-green/30 ring-4 ring-accent-green/10">
              <img src={selectedAvatar} alt="Your avatar" className="w-full h-full" />
            </div>
            <div>
              <p className="text-white/90 text-lg font-semibold">Profile Complete</p>
              <p className="text-white/40 text-sm mt-1">
                {firstName} {lastName} &middot; {occupation || "Member"}
              </p>
            </div>
            <div className="flex justify-center gap-2 text-xs text-white/30">
              {phone && <span className="bg-white/5 px-3 py-1 rounded-full">{phone}</span>}
              {findUs && <span className="bg-white/5 px-3 py-1 rounded-full">Found via: {findUs}</span>}
            </div>
          </div>
        ) : (
          <>
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" placeholder="John" type="text" value={firstName} onChange={setFirstName} icon={User} />
                <InputGroup label="Last Name" placeholder="Doe" type="text" value={lastName} onChange={setLastName} icon={User} />
              </div>
            )}
            <InputGroup
              label="Email"
              placeholder="hello@example.com"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); setFieldErrors((p) => ({ ...p, email: undefined })); }}
              error={fieldErrors.email}
              icon={Mail}
            />
            <InputGroup
              label="Password"
              placeholder="8+ characters"
              type="password"
              value={password}
              onChange={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: undefined })); }}
              error={fieldErrors.password}
              icon={Shield}
            />
          </>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {isOtpStep && (
          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full h-14 bg-gradient-to-r from-accent-green to-primary-green text-white font-semibold rounded-2xl hover:from-accent-green hover:to-primary-green/80 active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-green/20 hover:shadow-accent-green/30"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : "Verify & Continue"}
          </button>
        )}

        {signupPhase === 2 && (
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-accent-green to-primary-green text-white font-semibold rounded-2xl hover:from-accent-green hover:to-primary-green/80 active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-green/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
          </button>
        )}

        {signupPhase === 3 && (
          <button
            type="button"
            onClick={handleCompleteSetup}
            className="w-full h-14 bg-gradient-to-r from-accent-green to-primary-green text-white font-semibold rounded-2xl hover:from-accent-green hover:to-primary-green/80 active:scale-[0.98] transition-all duration-300 mt-4 shadow-lg shadow-accent-green/20"
          >
            Go to Dashboard
          </button>
        )}

        {!isOtpStep && signupPhase < 2 && (
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-accent-green to-primary-green text-white font-semibold rounded-2xl hover:from-accent-green hover:to-primary-green/80 active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-green/20 hover:shadow-accent-green/30"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSignUp ? "Send Verification Code" : "Sign In"}
          </button>
        )}

        {!isOtpStep && signupPhase < 2 && (
          <button
            type="button"
            onClick={handleOtpLogin}
            disabled={loading}
            className="w-full h-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-sm font-medium text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all disabled:opacity-50"
          >
            Send one-time code
          </button>
        )}
      </form>

      {!isOtpStep && signupPhase < 2 && (
        <p className="text-center text-sm text-white/30">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button type="button" onClick={switchMode} className="text-accent-green/80 hover:text-accent-green font-medium transition-colors">
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
    <main className="flex min-h-screen w-full selection:bg-accent-green/30 transition-all duration-500 lg:h-screen lg:overflow-hidden" style={{ background: "#08150F" }}>
      {/* Left: Brand / Video Column */}
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-surface-dark/80 to-rich-black/90" />
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-accent-green/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-primary-green/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-xs space-y-8"
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <h2 className="text-4xl font-bold tracking-tight whitespace-nowrap text-white">
              {showSteps ? "Join Tirbeo" : "Welcome Back"}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed px-4 mt-3">
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

      {/* Right: Form Column */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl relative z-10">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
            </div>
          }>
            <LoginForm onPhaseChange={handlePhaseChange} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
