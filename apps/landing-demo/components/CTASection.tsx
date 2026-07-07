"use client";

export function CTASection() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 px-6">
      <div className="mx-auto max-w-lg text-center">
        <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-[#F97316]">Stay connected</span>
        <h2 className="reveal mt-3 text-3xl font-bold text-white md:text-4xl">Get early access</h2>
        <p className="reveal mt-3 text-white/30">Be first to hear about new features and launch updates.</p>

        <div className="reveal mt-8">
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 sm:flex-row">
            <input type="email" placeholder="your@email.com" required
              className="flex-1 min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#F25604]/30 backdrop-blur-lg"
            />
            <button type="submit"
              className="rounded-2xl bg-gradient-to-r from-[#F25604] to-[#F97316] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#F25604]/20"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-xs text-white/15">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
