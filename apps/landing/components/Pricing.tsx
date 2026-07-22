"use client";

import { useState } from "react";
import { useLandingConfig } from "./LandingContentProvider";

const faqItems = [
  {
    question: "What is Tirbeo?",
    answer:
      "Tirbeo is a community-first platform designed for meaningful conversations, thoughtful discovery, and privacy-forward connections.",
  },
  {
    question: "How do I join?",
    answer:
      "Enter your email below to get early access updates, launch invitations, and product news first.",
  },
  {
    question: "How is my data handled?",
    answer:
      "Your data stays private. We only use it to personalize your experience and never sell it to third parties.",
  },
];

export function Pricing() {
  const [openIndex, setOpenIndex] = useState(0);
  const cfg = useLandingConfig().newsletter;

  return (
    <section id="pricing" className="relative overflow-hidden px-6 py-28" style={{ background: 'rgba(10,10,15,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "url(/footer.png)" }} />

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="gsap-reveal font-heading text-4xl font-bold text-white sm:text-5xl">
          {cfg.headline}
        </h2>
        <p className="gsap-reveal mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#94A3B8]">
          {cfg.subtext}
        </p>

        <div className="gsap-reveal mt-12 space-y-4 text-left">
          {faqItems.map((item, index) => {
            const isOpen = index === openIndex;
            return (
              <div
                key={item.question}
                className="gsap-stagger-card overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.08] hover:shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-white transition duration-300 hover:bg-white/[0.08]"
                >
                  <span className="text-sm font-semibold sm:text-base">{item.question}</span>
                  <span className={`flex-shrink-0 text-lg text-[#FE8624] transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                    ▾
                  </span>
                </button>
                <div className={`overflow-hidden px-6 transition-[max-height,opacity] duration-300 ${isOpen ? "max-h-44 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="pb-5 text-sm leading-relaxed text-[#FE8624]">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="gsap-reveal mt-14 rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
          <div className="rounded-[1.75rem] bg-black/80 px-6 py-8 sm:px-8">
            <div className="text-left">
              <p className="text-sm uppercase tracking-[0.32em] text-[orange] opacity-90">{cfg.badge}</p>
              <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{cfg.headline}</h3>
              <p className="mt-3 max-w-2xl text-sm text-[#94a3b8] sm:text-base">
                {cfg.subtext}
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
              <input
                type="email"
                placeholder={cfg.placeholder}
                required
                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white outline-none transition duration-300 placeholder:text-[#94a3b8] focus:border-[#2F4FC4]/40 focus:ring-2 focus:ring-[#2F4FC4]/15"
                style={{ backdropFilter: "blur(18px)" }}
              />
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-[#FE8624] to-[#F97316] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_24px_60px_rgba(254,134,36,0.3)] hover:scale-105 active:scale-[0.98]"
              >
                {cfg.buttonLabel}
              </button>
            </form>

            <p className="mt-4 text-xs" style={{ color: cfg.accentColor }}>{cfg.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
