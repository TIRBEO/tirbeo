import { CityScene } from "../components/CityScene";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { AboutSection } from "../components/AboutSection";
import { StackedSection } from "../components/StackedSection";
import { Pricing } from "../components/Pricing";
import { Footer } from "../components/Footer";
import { ScrollAnimations } from "../components/ScrollAnimations";
import { Preloader } from "../components/Preloader";
import { LandingContentProvider } from "../components/LandingContentProvider";

export default function LandingPage() {
  return (
    <LandingContentProvider>
      <CityScene />
      <Preloader />
      <div className="relative z-10">
        <Header />
        <main>
          <ScrollAnimations><Hero /></ScrollAnimations>
          <AboutSection />
          <ScrollAnimations><StackedSection /></ScrollAnimations>
          <ScrollAnimations><Pricing /></ScrollAnimations>
        </main>
        <ScrollAnimations><Footer /></ScrollAnimations>
      </div>
    </LandingContentProvider>
  );
}