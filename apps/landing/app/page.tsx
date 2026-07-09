"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const VIDEOS = {
  left: "https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260625_154433_532a85d3-dabf-4265-b8bd-19ac6af31842.mp4",
  right: "https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260625_154401_a664f076-b971-4557-8728-40ef9ea4c49b.mp4",
};

const IMAGES = Array.from({ length: 10 }, (_, i) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_${[
    "104530_521b2f85-c0f3-4d0e-9704-b578315b4cb9",
    "103711_76ccdb8b-5043-4f47-9c54-4379713393ea",
    "103728_394f6a1b-85e2-4386-a4f6-408472a0a5b7",
    "103739_86743e0e-16a7-4bee-bf38-dd67985344dc",
    "103748_b2215dc8-a3a7-470d-b19a-5b87fa7d0c37",
    "103758_e919ce72-5c9d-4b87-9be6-d7647b34825c",
    "103808_013583d0-3386-4547-9832-37c7d8edb3ac",
    "103937_a0c49d0a-33eb-4ead-aea6-c1baf241acbc",
    "103956_d18ed8fd-7f6b-4b86-91f9-20010fe38670",
    "104034_ba5a9963-87ff-4008-a545-6bd686c088b5",
  ][i]}.png&w=1920&q=85`
);

const SYMBOLS = ["8", "$", "^^", "%", "/"];
const FONT = { fontFamily: "'Inter Tight', sans-serif", fontWeight: 500 as const, letterSpacing: "-0.04em", color: "#fff" };

function buildLayout(count: number, cols: number) {
  const rows: number[][] = [];
  let idx = 0;
  let row = 0;
  while (idx < count) {
    const r: number[] = [];
    const a = (row * 2 + (row % 2)) % cols;
    const placed = new Set<number>();
    r[a] = idx++;
    placed.add(a);
    if (row % 3 === 0 && idx < count) {
      let b = (a + 2) % cols;
      if (b === a) b = (a + 1) % cols;
      if (!placed.has(b)) { r[b] = idx++; placed.add(b); }
    }
    for (let c = 0; c < cols; c++) { if (r[c] === undefined) r[c] = -1; }
    rows.push(r);
    row++;
  }
  return rows;
}

function CursorSVG() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22.75" stroke="white" strokeWidth="2.5" />
      <path d="M16 28 Q20 18 24 24 Q28 18 32 28" fill="white" />
    </svg>
  );
}

function LogoSVG() {
  return (
    <svg viewBox="0 0 355 110" fill="none">
      <text x="0" y="70" fontFamily="'Inter Tight', sans-serif" fontSize="64" fontWeight="700" fill="white" letterSpacing="-2">prmpt</text>
      <circle cx="310" cy="38" r="20" stroke="white" strokeWidth="2.5" fill="none" />
      <text x="318" y="45" fontFamily="'Inter Tight', sans-serif" fontSize="18" fontWeight="500" fill="white">R</text>
    </svg>
  );
}

function HamburgerSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={size} height={size}>
      <path d="M0 14H40" stroke="white" strokeWidth="2.5" />
      <path d="M0 26H40" stroke="white" strokeWidth="2.5" />
    </svg>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoLeftRef = useRef<HTMLVideoElement>(null);
  const videoRightRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [vh, setVh] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [symbol, setSymbol] = useState("8");
  const [entered, setEntered] = useState(false);
  const rafRef = useRef<number>(0);

  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 640 && window.innerWidth < 1024;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // Custom cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || isTouchDevice) return;
    const move = (e: MouseEvent) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [isTouchDevice]);

  // Entrance animations
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Symbol randomizer on scroll
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        setTimeout(() => {
          setSymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
          ticking = false;
        }, 80);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Video scrub on mouse move (desktop non-touch)
  useEffect(() => {
    if (isTouchDevice || !videoLeftRef.current || !videoRightRef.current) return;
    const leftVid = videoLeftRef.current;
    const rightVid = videoRightRef.current;
    const w = window.innerWidth;
    const deadZonePx = Math.max(30, w * 0.05);
    const activeSideRef = { current: "right" as "left" | "right" };
    let mouseX = w / 2;
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const tick = () => {
      const cx = window.innerWidth / 2;
      const dist = mouseX - cx;
      const abs = Math.abs(dist);

      if (abs <= deadZonePx) {
        if (activeSideRef.current === "left") { if (!leftVid.seeking) leftVid.currentTime = 0; }
        else { if (!rightVid.seeking) rightVid.currentTime = 0; }
        raf = requestAnimationFrame(tick);
        return;
      }

      if (dist > 0) {
        activeSideRef.current = "left";
        leftVid.style.display = "block";
        rightVid.style.display = "none";
        const range = window.innerWidth / 2 - deadZonePx;
        const progress = Math.min(1, (dist - deadZonePx) / range);
        if (!leftVid.seeking) leftVid.currentTime = progress * (leftVid.duration || 0);
      } else {
        activeSideRef.current = "right";
        leftVid.style.display = "none";
        rightVid.style.display = "block";
        const range = window.innerWidth / 2 - deadZonePx;
        const progress = Math.min(1, (abs - deadZonePx) / range);
        if (!rightVid.seeking) rightVid.currentTime = progress * (rightVid.duration || 0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [isTouchDevice]);

  // Mobile auto-play
  useEffect(() => {
    if (!isTouchDevice) return;
    const leftVid = videoLeftRef.current;
    const rightVid = videoRightRef.current;
    if (!leftVid || !rightVid) return;
    let current: "left" | "right" = "left";
    leftVid.loop = false;
    rightVid.loop = false;
    leftVid.play();
    const next = () => {
      if (current === "left") {
        leftVid.style.display = "none";
        rightVid.style.display = "block";
        rightVid.currentTime = 0;
        rightVid.play();
        current = "right";
      } else {
        rightVid.style.display = "none";
        leftVid.style.display = "block";
        leftVid.currentTime = 0;
        leftVid.play();
        current = "left";
      }
    };
    leftVid.addEventListener("ended", next);
    rightVid.addEventListener("ended", next);
    return () => {
      leftVid.removeEventListener("ended", next);
      rightVid.removeEventListener("ended", next);
    };
  }, [isTouchDevice]);

  // RAF scroll animation
  useEffect(() => {
    const vh = window.innerHeight;
    setVh(vh);
    const wrap = wrapperRef.current;
    const panel = panelRef.current;
    const spacer = containerRef.current;
    const overlay = overlayRef.current;
    const info = infoRef.current;
    const buy = buyRef.current;
    const foot = footerRef.current;
    const vw = videoWrapRef.current;
    if (!wrap || !panel || !spacer || !overlay || !info || !buy || !foot || !vw) return;

    const totalImages = 10;
    const cols = window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 4;
    const layout = buildLayout(totalImages, cols);
    const cards = panel.querySelectorAll<HTMLElement>(".bp-card");
    const outros = parseFloat(info.dataset.outroOffset || "166");

    const wrapScrollHeight = wrap.scrollHeight;
    const max = wrapScrollHeight - vh;
    setMaxScroll(max);
    spacer.style.height = `${vh + max + 2 * vh}px`;

    const scrollTick = () => {
      const sy = window.scrollY;
      if (sy <= vh) {
        panel.style.transform = `translateY(${vh - sy}px)`;
        vw.style.visibility = "visible";
        const progress = sy / vh;
        overlay.style.opacity = "0";
        info.style.transform = `translateY(0)`;
        buy.style.transform = `scale(0)`;
        foot.style.opacity = "0";
        cards.forEach((card, i) => {
          const frameIdx = layout.flat()[i];
          if (frameIdx === undefined || frameIdx < 0) { card.style.transform = "scale(0)"; return; }
          const rect = card.getBoundingClientRect();
          const top = rect.top;
          const bottom = rect.bottom;
          const enter = Math.min(1, (vh - top) / (vh * 0.6));
          const exit = Math.min(1, bottom / (vh * 0.4));
          const scale = Math.min(enter, exit);
          card.style.transform = bottom <= 0 || top >= vh ? "scale(0)" : `scale(${Math.max(0, scale)})`;
        });
      } else {
        panel.style.transform = "translateY(0)";
        vw.style.visibility = "hidden";
        const innerSy = sy - vh;
        wrap.style.transform = `translateY(-${Math.min(innerSy, max)}px)`;
        const outroProgress = sy > vh + max ? Math.min(1, (sy - vh - max) / (vh - 100)) : 0;
        overlay.style.opacity = String(outroProgress);
        info.style.transform = `translateY(-${outros * outroProgress}px)`;
        foot.style.opacity = String(outroProgress);
        buy.style.transform = `scale(${outroProgress})`;
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const top = rect.top;
          const bottom = rect.bottom;
          const enter = Math.min(1, (vh - top) / (vh * 0.6));
          const exit = Math.min(1, bottom / (vh * 0.4));
          const scale = Math.min(enter, exit);
          card.style.transform = bottom <= 0 || top >= vh ? "scale(0)" : `scale(${Math.max(0, scale)})`;
        });
      }
      rafRef.current = requestAnimationFrame(scrollTick);
    };
    rafRef.current = requestAnimationFrame(scrollTick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const w = typeof window !== "undefined" ? window.innerWidth : 1024;
  const cols = w < 640 ? 2 : w < 1024 ? 3 : 4;
  const layout = buildLayout(IMAGES.length, cols);

  const anm = (delay: number, y = 12) => ({
    opacity: entered ? 1 : 0,
    transform: entered ? "translateY(0)" : `translateY(${y}px)`,
    transition: `opacity 0.6s cubic-bezier(0.25,0.1,0.25,1) ${delay}s, transform 0.6s cubic-bezier(0.25,0.1,0.25,1) ${delay}s`,
  });

  // Responsive values
  const logoW = isMobile ? 124 : isTablet ? 266 : 355;
  const logoTop = isMobile ? 16 : 32;
  const logoLeft = isMobile ? 16 : 32;
  const capLeft = isMobile ? 16 : 32;
  const capTop = isMobile ? 118 : isTablet ? 180 : 244;
  const capW = isMobile ? "calc(100vw - 32px)" : isTablet ? "calc(50vw - 48px)" : 692;
  const navTop = isMobile ? 16 : 32;
  const navRight = isMobile ? 16 : 32;
  const hamburgerSize = isDesktop ? 30 : 24;
  const cartSize = isDesktop ? 15 : 13;
  const infoBottom = isMobile ? 48 : 80;
  const infoW = isMobile ? "auto" : 330;
  const circleSize = isDesktop ? 30 : 20;
  const circleFontSz = isDesktop ? 15 : 10;
  const labelSz = isDesktop ? 30 : 20;
  const priceSz = isDesktop ? 80 : 60;
  const buyW = isMobile ? "auto" : 330;
  const buyH = isMobile ? 100 : 174;
  const buyFontSz = isMobile ? 72 : 110;
  const buyL = isMobile ? 16 : "auto";
  const buyR = isMobile ? 16 : 32;
  const buyB = isMobile ? 60 : 32;
  const footB = isMobile ? 24 : 32;
  const footGap = isDesktop ? 80 : "space-between" as any;
  const footSz = isDesktop ? 13 : 11;

  return (
    <div ref={containerRef} id="scroll-spacer" style={{ position: "relative", userSelect: "none", background: "#0B0B0D" }}>
      {/* Custom Cursor (desktop only) */}
      <div ref={cursorRef} className="custom-cursor" style={{ display: isTouchDevice ? "none" : "block" }}>
        <CursorSVG />
      </div>

      {/* Logo */}
      <div className="fixed pointer-events-none z-20" style={{ mixBlendMode: "exclusion", top: logoTop, left: logoLeft, width: logoW, ...anm(0, 12) }}>
        <LogoSVG />
      </div>

      {/* Caption */}
      <div className="fixed pointer-events-none z-20" style={{ mixBlendMode: "exclusion", left: capLeft, top: capTop, width: capW, ...anm(0.3, 12) }}>
        <p style={{ ...FONT, fontSize: 12, lineHeight: "140%", letterSpacing: "-0.04em", color: "#fff" }}>
          When switching between videos near the center, do not reset currentTime to 0 abruptly. Add a small dead zone: if cursor is within +/-50px of center, keep both videos at currentTime = 0 and show whichever was last active.
        </p>
      </div>

      {/* Navigation */}
      <nav className="fixed z-20 pointer-events-none" style={{ mixBlendMode: "exclusion", top: navTop, right: navRight, width: isDesktop ? 330 : "auto", height: 30, display: "flex", justifyContent: "space-between", alignItems: "center", ...anm(0.15, 12) }}>
        <span style={{ ...FONT, fontSize: 15, letterSpacing: "0.05em", color: "#fff", display: isMobile ? "none" : "block" }}>ABOUT</span>
        <div style={{ display: "flex", gap: isDesktop ? 50 : 20, alignItems: "center" }}>
          <HamburgerSVG size={hamburgerSize} />
          <span style={{ ...FONT, fontSize: cartSize, letterSpacing: "0.05em", color: "#fff" }}>[ CART ]</span>
        </div>
      </nav>

      {/* Product Info */}
      <div ref={infoRef} id="outro-info" className="fixed pointer-events-none z-20" data-outro-offset={isMobile ? "132" : "166"} style={{ mixBlendMode: "exclusion", right: isMobile ? "auto" : 32, left: isMobile ? 0 : "auto", bottom: infoBottom, width: infoW, display: "flex", flexDirection: "column", alignItems: "center", ...anm(0.45, 12) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: isMobile ? 252 : "100%", marginBottom: isMobile ? 12 : 32 }}>
          <div style={{ position: "relative", width: circleSize, height: circleSize }}>
            <svg width={circleSize} height={circleSize} viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.75" stroke="white" strokeWidth={isDesktop ? 2.5 : 2} fill="none" /></svg>
            <span id="circle-symbol" style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", ...FONT, fontSize: circleFontSz, letterSpacing:"-0.04em", color:"#fff", textTransform:"uppercase" }}>{symbol}</span>
          </div>
          <span style={{ ...FONT, fontSize: labelSz, lineHeight: "100%", textAlign: "center", letterSpacing: "-0.04em", color: "#fff", marginTop: 12, textTransform: "uppercase" }}>
            ARCHIVE COLLECTION<br />&ldquo;PROMPT&rdquo;
          </span>
        </div>
        <span style={{ ...FONT, fontSize: priceSz, lineHeight: "100%", textAlign: "center", letterSpacing: "-0.04em", color: "#fff" }}>
          $97,33
        </span>
      </div>

      {/* View Button */}
      <div ref={buyRef} id="outro-buy" className="fixed pointer-events-none z-20" style={{ mixBlendMode:"exclusion", right: buyR, bottom: buyB, left: buyL, width: buyW, height: buyH, transform:"scale(0)", transformOrigin:"right bottom", background:"#fff", borderRadius:1335, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Inter Tight', sans-serif", fontWeight:500, fontSize: buyFontSz, letterSpacing:"-0.04em", color:"#fff", mixBlendMode:"exclusion" }}>view</span>
      </div>

      {/* Video Container */}
      <div ref={videoWrapRef} id="main-canvas" className="fixed pointer-events-none" style={{
        inset: isMobile ? undefined : 0,
        left: 0,
        top: isMobile ? 220 : 0,
        width: "100vw",
        height: isMobile ? "calc(100vh - 220px)" : "100%",
        zIndex: 0,
        overflow: "hidden",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        <video ref={videoLeftRef} muted playsInline preload="auto" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"none" }}
          onLoadedData={() => { if (videoRightRef.current?.readyState) setLoaded(true); }}>
          <source src={VIDEOS.left} type="video/mp4" />
        </video>
        <video ref={videoRightRef} muted playsInline preload="auto" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onLoadedData={() => { if (videoLeftRef.current?.readyState) setLoaded(true); }}>
          <source src={VIDEOS.right} type="video/mp4" />
        </video>
      </div>

      {/* White Overlay */}
      <div ref={overlayRef} id="outro-overlay" className="fixed pointer-events-none" style={{ inset:0, zIndex:12, background:"#fff", opacity:0 }} />

      {/* Footer */}
      <div ref={footerRef} id="outro-footer" className="fixed pointer-events-none z-20" style={{ mixBlendMode:"exclusion", left:16, bottom:footB, display:"flex", gap: isDesktop ? 80 : "space-between", opacity:0, width: isMobile ? "calc(100vw - 32px)" : "auto" }}>
        <span style={{ fontFamily:"'Inter Tight', sans-serif", fontWeight:500, fontSize: footSz, letterSpacing:"-0.02em", color:"#fff", textTransform:"uppercase" }}>PRMPT (R) 2026</span>
        <span style={{ fontFamily:"'Inter Tight', sans-serif", fontWeight:500, fontSize: footSz, letterSpacing:"-0.02em", color:"#fff", textTransform:"uppercase" }}>PRIVACY POLICY</span>
      </div>

      {/* Black Panel (Gallery) */}
      <div ref={panelRef} className="fixed" style={{ inset:0, background:"#0B0B0D", zIndex:10, transform:"translateY(100vh)", overflow:"hidden" }}>
        <div ref={wrapperRef} className="bp-wrapper" style={{ width:"100%", paddingTop:"min(400px, 40vh)" }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:8, padding:"0 16px" }}>
            {layout.flat().map((imgIdx, i) => {
              const isLeft = i % cols < cols / 2;
              if (imgIdx < 0) return <div key={`empty-${i}`} style={{ aspectRatio:"2/3" }} />;
              return (
                <div key={`card-${imgIdx}`} className="bp-card" style={{ aspectRatio:"2/3", transform:"scale(0)", transformOrigin: isLeft ? "right bottom" : "left bottom", borderRadius:12, overflow:"hidden" }}>
                  <img src={IMAGES[imgIdx]} alt={`Gallery ${imgIdx + 1}`} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
