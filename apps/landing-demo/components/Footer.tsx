export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <a href="/" className="text-lg font-bold text-white">Tirbeo</a>
            <p className="mt-2 max-w-xs text-sm text-white/25">Connecting communities through meaningful conversations.</p>
          </div>
          <div className="flex gap-10">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/30">Platform</h4>
              <ul className="space-y-2.5 text-sm text-white/25">
                <li><a href="#features" className="transition-colors hover:text-white/50">Features</a></li>
                <li><a href="#contact" className="transition-colors hover:text-white/50">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/30">Legal</h4>
              <ul className="space-y-2.5 text-sm text-white/25">
                <li><span className="cursor-default">Privacy</span></li>
                <li><span className="cursor-default">Terms</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/[0.04] pt-6 text-center text-sm text-white/15">
          &copy; {new Date().getFullYear()} Tirbeo
        </div>
      </div>
    </footer>
  );
}
