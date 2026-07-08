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

export default function LandingPage() {
  return (
    <>
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
        <ScrollMarquee />
        <StickyCards />
        <ScrollAnimations>
          <Pricing />
        </ScrollAnimations>
      </main>
      <ScrollAnimations>
        <Footer />
      </ScrollAnimations>
    </>
  );
}
