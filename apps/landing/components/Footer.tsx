"use client";

import { appUrl } from "@/lib/domains";
import { useLandingConfig } from "./LandingContentProvider";

export function Footer() {
  const cfg = useLandingConfig();
  const { footer, newsletter, navbar } = cfg;

  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-16">
      
      <div className="absolute bottom-0 h-[250%] bg-cover bg-center bg-no-repeat " style={{ backgroundImage: "url(/footer.png)" }} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-start">
          <div className="gsap-reveal flex flex-col items-start space-y-5">
            <a href="/" className="flex-shrink-99 ">
              <img src={navbar.logoUrl || "/logo1.png"} alt={navbar.siteName} className="h-10 w-auto max-w-[180px] object-contain" />
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
            <h4 className="mb-5 text-sm font-semibold text-[#F97316]">{newsletter.headline}</h4>
            <p className="mb-4 max-w-xs text-sm text-white/70">
              {newsletter.subtext}
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder={newsletter.placeholder}
                className="rounded bg-black/70 backdrop-blur-lg px-3 py-2 text-sm text-white placeholder-white focus:outline-none border border-white/20"
              />
              <button
                type="submit"
                className="rounded bg-gradient-to-r from-[#F25604] to-[#F97316] px-4 py-2 text-sm font-medium text-white hover:shadow-[0_12px_30px_rgba(242,86,4,0.25)] transition-all"
              >
                {newsletter.buttonLabel}
              </button>
              <p className="text-xs text-white/70">{newsletter.disclaimer}</p>
            </form>
          </div>
          )}

          </div>

        <div className="gsap-reveal mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-sm text-[#64748B] md:flex-row">
          <p>&copy; {new Date().getFullYear()} {navbar.siteName}. {footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
