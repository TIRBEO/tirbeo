"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@tirbeo/auth";
import { appUrl } from "@tirbeo/utils";
import { motion } from "motion/react";
import { Circle, Chrome, Github, Eye, EyeOff } from "lucide-react";

function StepItem({ number, text, active }: { number: number; text: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? "bg-white text-black border border-white" : "bg-brand-gray text-white border-none"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${active ? "bg-black text-white" : "bg-white/10 text-white/40"}`}>
        {String(number).padStart(2, "0")}
      </div>
      <span className={`text-sm font-medium ${active ? "" : "text-white/60"}`}>{text}</span>
    </div>
  );
}

function SocialButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="flex items-center justify-center gap-2 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all duration-200">
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

function InputGroup({ label, placeholder, type, value, onChange }: {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
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
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const { signInWithPassword, signInWithOtp, signInWithGoogle, signUp, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const redirectTo = searchParams.get("redirect") || appUrl("dashboard");

  useEffect(() => {
    if (user && !isLoading) {
      window.location.href = redirectTo;
    }
  }, [user, isLoading, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSignUp) {
      const result = await signUp(email, password, firstName || email.split('@')[0]);
      if (result.error) setError(result.error);
    } else {
      const result = await signInWithPassword(email, password);
      if (result.error) setError(result.error);
    }
  };

  const handleOtpLogin = async () => {
    setError(null);
    const result = await signInWithOtp(email);
    if (result.error) setError(result.error);
    else setOtpSent(true);
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (otpSent) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full glass">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-xl font-medium tracking-tight">Check your email</h2>
        <p className="text-sm text-white/40">We sent a one-time code to <strong className="text-white/60">{email}</strong></p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full max-w-xl mx-auto space-y-8 lg:space-y-6 sm:space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-medium tracking-tight">{isSignUp ? "Create New Profile" : "Welcome Back"}</h1>
        <p className="text-white/40 text-sm mt-1">
          {isSignUp ? "Input your basic details to begin the journey." : "Sign in to your account to continue."}
        </p>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <SocialButton icon={Chrome} label="Google" />
        <SocialButton icon={Github} label="Github" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignUp && (
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="First Name" placeholder="John" type="text" value={firstName} onChange={setFirstName} />
            <InputGroup label="Last Name" placeholder="Doe" type="text" value={lastName} onChange={setLastName} />
          </div>
        )}
        <InputGroup label="Email" placeholder="hello@example.com" type="email" value={email} onChange={setEmail} />
        <InputGroup label="Password" placeholder="••••••••" type="password" value={password} onChange={setPassword} />

        {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4">
          {isSignUp ? "Create Account" : "Sign In"}
        </button>

        <button type="button" onClick={handleOtpLogin} className="w-full h-12 glass rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all">
          Send one-time code
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-white/40">
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-white underline hover:text-white/80 transition-colors">
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 transition-all duration-500 lg:h-screen lg:overflow-hidden">
      {/* Left Column — Video Background */}
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
          className="relative z-10 w-full max-w-xs space-y-8"
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-2">
            <Circle className="w-5 h-5 fill-white text-white" />
            <span className="text-xl font-semibold tracking-tight">Aurora</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap">Join Aurora</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
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

      {/* Right Column — Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-xl">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
