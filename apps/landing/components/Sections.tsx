import React from "react";
import { MessageCircle, Zap, Shield, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="section-wrapper min-h-[120vh] flex-col justify-center text-center">
      <div className="max-w-4xl mx-auto space-y-6 pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00ff66]/20 bg-[#00ff66]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00ff66]">
          Tirbeo — Social Media Web Design Agency
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter">
          Stunning. Fast. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff66] to-[#047832] text-glow-green">
            Engaging Work.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
          We craft high-converting, immersive, glassmorphic interfaces and custom web architectures for creators, platforms, and modern brands looking to dominate social spaces.
        </p>
      </div>
      
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse opacity-70">
        <span className="block h-12 w-[1px] bg-gradient-to-b from-transparent via-[#00ff66]/50 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#00ff66]">Scroll to Merge</span>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="section-wrapper min-h-[150vh] flex items-center justify-end px-6 md:px-24">
      {/* Content aligns to the right while rock is on the left */}
      <div className="w-full max-w-xl text-left">
        <span className="text-xs uppercase tracking-[0.22em] text-[#00ff66] font-bold">
          About Tirbeo
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          We Craft the Future of <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#00ff66] to-[#047832]">Social Spaces</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/70">
          Tirbeo is an elite digital collective operating at the intersection of high-fidelity 3D interaction, immersive visual design, and high-performance social platforms. We help creators and modern SaaS ecosystems scale through considered, premium user experiences.
        </p>
        
        <div className="mt-10">
          <a href="#features" className="btn-glass px-6 py-3 rounded-full text-sm inline-block">
            View Capabilities
          </a>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    { title: "Social Ecosystems", desc: "Optimized for community growth.", icon: MessageCircle },
    { title: "Viral Speed", desc: "Lightweight build parameters.", icon: Zap },
    { title: "Conversion", desc: "Custom funnels for cold traffic.", icon: TrendingUp },
    { title: "Resilience", desc: "Enterprise-grade infrastructure.", icon: Shield },
  ];

  return (
    <section id="features" className="section-wrapper min-h-[180vh] flex-col items-center pt-32">
      <div className="text-center max-w-3xl mb-32">
        <span className="text-xs uppercase tracking-[0.22em] text-[#00ff66] font-bold">
          Features & Capabilities
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
          Optimized for the Social Age
        </h2>
      </div>
      
      {/* Circular / Path layout represented by scattered glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto relative z-20">
        {features.map((f, i) => (
          <div key={i} className={`glass-panel p-8 rounded-3xl ${i % 2 !== 0 ? 'md:mt-24' : ''}`}>
            <div className="w-12 h-12 rounded-xl bg-[#00ff66]/10 flex items-center justify-center text-[#00ff66] mb-6">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
            <p className="text-white/60 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FoundationSection() {
  return (
    <section id="foundation" className="section-wrapper min-h-[150vh] flex items-center justify-start px-6 md:px-24">
      {/* Content aligns to the left while foundation deck is on the right/center */}
      <div className="w-full max-w-xl text-left mt-40">
        <span className="text-xs uppercase tracking-[0.22em] text-[#00ff66] font-bold">
          Architecture
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Foundation.<br />Framework.<br />Connection.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/70">
          We don't just design interfaces; we build robust underlying architectures. Our layered approach ensures that from the database foundation to the frontend framework, every connection is flawless and hyper-optimized.
        </p>
      </div>
    </section>
  );
}

export function FooterSection() {
  return (
    <footer id="contact" className="relative min-h-[80vh] flex flex-col items-center justify-center border-t border-[#00ff66]/20 bg-black/40 backdrop-blur-md pt-20">
      <div className="glass-panel p-10 md:p-16 rounded-3xl text-center max-w-3xl w-full mx-4">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to dominate social spaces?</h2>
        <p className="text-white/60 mb-8">Join the elite brands working with Tirbeo.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00ff66]/50"
          />
          <button className="btn-solid-green px-8 py-3 rounded-full text-black">
            Get Started
          </button>
        </div>
      </div>
      
      <div className="mt-32 pb-10 text-white/40 text-sm flex gap-6">
        <span>© 2026 Tirbeo Agency. All rights reserved.</span>
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
      </div>
    </footer>
  );
}
