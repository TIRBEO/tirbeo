"use client";

import { useState } from "react";
import { appUrl } from "@/lib/domains";
import { useSiteConfig } from "./SiteConfigProvider";

export function Footer() {
  const config = useSiteConfig();
  const { footer, newsletter } = config;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`${appUrl("api", "/api/newsletter/subscribe")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-16">
      
      <div className="absolute bottom-0 h-[250%] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/footer.png)" }} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-start">
          <div className="gsap-reveal flex flex-col items-start space-y-5">
            <a href="/" className="flex-shrink-99">
              <img src="/logo1.png" alt="Tirbeo" className="h-10 w-auto max-w-[180px] object-contain" />
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-[#94A3B8]">
              {footer.tagline}
            </p>
          </div>

          <div className="gsap-reveal flex flex-col items-start">
            <h4 className="mb-5 text-sm font-semibold text-[#F97316]">Platform</h4>
            <ul className="space-y-3.5 text-sm text-[#94A3B8]">
              <li><a href="#about" className="transition-colors duration-200 hover:text-[#F25604]">About</a></li>
              <li><a href={appUrl("chat")} className="transition-colors duration-200 hover:text-[#F25604]">Chat</a></li>
            </ul>
          </div>

          <div className="gsap-reveal flex flex-col items-start">
            <h4 className="mb-5 text-sm font-semibold text-[#F97316]">Company</h4>
            <ul className="space-y-3.5 text-sm text-[#94A3B8]">
              <li><a href={appUrl("docs", "/about")} className="transition-colors duration-200 hover:text-[#F25604]">About</a></li>
              <li><a href={appUrl("support", "/contact")} className="transition-colors duration-200 hover:text-[#F25604]">Contact</a></li>
              <li><span className="cursor-default transition-colors duration-200 hover:text-[#F25604]">Privacy</span></li>
              <li><span className="cursor-default transition-colors duration-200 hover:text-[#F25604]">Terms</span></li>
            </ul>
          </div>

          <div className="gsap-reveal flex flex-col items-start">
            <h4 className="mb-5 text-sm font-semibold text-[#F97316]">Connect</h4>
            <ul className="space-y-3.5 text-sm text-[#94A3B8]">
              <li><span className="cursor-default transition-colors duration-200 hover:text-[#F25604]">X (Twitter)</span></li>
              <li><span className="cursor-default transition-colors duration-200 hover:text-[#F25604]">Discord</span></li>
              <li><span className="cursor-default transition-colors duration-200 hover:text-[#F25604]">GitHub</span></li>
            </ul>
          </div>

          {footer.showNewsletterForm && (
            <div className="gsap-reveal flex flex-col items-start">
              <h4 className="mb-5 text-sm font-semibold text-[#F97316]">Stay in the loop</h4>
              <p className="mb-4 max-w-xs text-sm text-white/70">
                {newsletter.subtext}
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={newsletter.placeholder}
                  required
                  disabled={status === "loading"}
                  className="rounded bg-black/70 backdrop-blur-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none border border-white/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded bg-gradient-to-r from-[#F25604] to-[#F97316] px-4 py-2 text-sm font-medium text-white hover:shadow-[0_12px_30px_rgba(242,86,4,0.25)] transition-all disabled:opacity-50"
                >
                  {status === "loading" ? "Subscribing..." : newsletter.buttonLabel}
                </button>
                {status === "success" && <p className="text-xs text-green-400">Subscribed!</p>}
                {status === "error" && <p className="text-xs text-red-400">Failed. Try again.</p>}
                {status === "idle" && <p className="text-xs text-white/50">{newsletter.disclaimer}</p>}
              </form>
            </div>
          )}
        </div>

        <div className="gsap-reveal mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-sm text-[#64748B] md:flex-row">
          <p>&copy; {new Date().getFullYear()} Tirbeo. {footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
