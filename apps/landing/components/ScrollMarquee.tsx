'use client';
import { useRef, useEffect, useState } from 'react';

const GIFS_ROW1 = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
];

const GIFS_ROW2 = [
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
];

export function ScrollMarquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const top = rect.top;
      const h = window.innerHeight;
      const scrollProgress = (-top + h) * 0.3;
      setOffset(scrollProgress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const row1Style = { transform: `translateX(${offset - 200}px)`, willChange: 'transform' as const };
  const row2Style = { transform: `translateX(${-(offset - 200)}px)`, willChange: 'transform' as const };

  const tripled1 = [...GIFS_ROW1, ...GIFS_ROW1, ...GIFS_ROW1];
  const tripled2 = [...GIFS_ROW2, ...GIFS_ROW2, ...GIFS_ROW2];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#010006] py-24 sm:py-32 md:py-40 pb-10">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3" style={row1Style}>
          {tripled1.map((src, i) => (
            <div key={`r1-${i}`} className="shrink-0 w-[420px] h-[270px] rounded-2xl overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="flex gap-3" style={row2Style}>
          {tripled2.map((src, i) => (
            <div key={`r2-${i}`} className="shrink-0 w-[420px] h-[270px] rounded-2xl overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
