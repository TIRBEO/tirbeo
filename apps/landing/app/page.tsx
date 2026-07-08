import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { AboutSection } from "../components/AboutSection";
import { StackedSection } from "../components/StackedSection";
import { ScrollMarquee } from "../components/ScrollMarquee";
import { StickyCards } from "../components/StickyCards";
import { Pricing } from "../components/Pricing";
import { Footer } from "../components/Footer";
import { ScrollAnimations } from "../components/ScrollAnimations";
import { Preloader } from "../components/Preloader";
import { SiteConfigProvider } from "../components/SiteConfigProvider";
import { getSiteConfig } from "../lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LandingPage() {
  const config = await getSiteConfig();

  return (
    <SiteConfigProvider config={config}>
      <Preloader />
      <Header />
      <main>
        <ScrollAnimations>
          <Hero />
        </ScrollAnimations>
        <ScrollAnimations>
          <AboutSection />
        </ScrollAnimations>
        <ScrollAnimations>
          <StackedSection />
        </ScrollAnimations>
        <ScrollAnimations>
          <StickyCards />
        </ScrollAnimations>
        <ScrollMarquee />
        <ScrollAnimations>
          <Pricing />
        </ScrollAnimations>
      </main>
      <ScrollAnimations>
        <Footer />
      </ScrollAnimations>
    </SiteConfigProvider>
  );
}
