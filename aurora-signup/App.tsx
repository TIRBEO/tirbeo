import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Chrome, Github, Eye, EyeOff, Circle } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StepItem({
  number,
  text,
  active,
}: {
  number: number;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active
          ? "bg-white text-black border border-white"
          : "bg-brand-gray text-white border-none"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
          active ? "bg-black text-white" : "bg-white/10 text-white/40"
        }`}
      >
        {String(number).padStart(2, "0")}
      </div>
      <span
        className={`text-sm font-medium ${active ? "" : "text-white/70"}`}
      >
        {text}
      </span>
    </div>
  );
}

function SocialButton({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all duration-200"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

function InputGroup({
  label,
  placeholder,
  type,
}: {
  label: string;
  placeholder: string;
  type: string;
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
          className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 outline-none text-sm"
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {isPwd && (
        <p className="text-xs text-white/30">Requires at least 8 symbols.</p>
      )}
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function App() {
  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column — Hero */}
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-xs space-y-8"
        >
          <motion.div variants={item} className="flex items-center gap-2">
            <Circle className="w-5 h-5 fill-white text-white" />
            <span className="text-xl font-semibold tracking-tight">Aurora</span>
          </motion.div>

          <motion.div variants={item}>
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap">
              Join Aurora
            </h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <StepItem number={1} text="Register your identity" active />
            <StepItem number={2} text="Configure your studio" />
            <StepItem number={3} text="Finalize your profile" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column — Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          <div>
            <h1 className="text-3xl font-medium tracking-tight">
              Create New Profile
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Input your basic details to begin the journey.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={Chrome} label="Google" />
            <SocialButton icon={Github} label="Github" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">
              Or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label="First Name"
                placeholder="John"
                type="text"
              />
              <InputGroup
                label="Last Name"
                placeholder="Doe"
                type="text"
              />
            </div>
            <InputGroup
              label="Email"
              placeholder="hello@example.com"
              type="email"
            />
            <InputGroup
              label="Password"
              placeholder="8+ characters"
              type="password"
            />

            <button
              type="submit"
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Member of the team?{" "}
            <button
              type="button"
              className="text-white underline hover:text-white/80 transition-colors"
            >
              Log in
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
