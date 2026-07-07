import { Preloader } from "../components/Preloader";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { ScrollAnimations } from "../components/ScrollAnimations";
import { Stats } from "../components/Stats";
import { Features } from "../components/Features";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";

export default function LandingDemoPage() {
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <ScrollAnimations><Hero /></ScrollAnimations>
        <ScrollAnimations><Stats /></ScrollAnimations>
        <ScrollAnimations><Features /></ScrollAnimations>
        <ScrollAnimations><CTASection /></ScrollAnimations>
      </main>
      <ScrollAnimations><Footer /></ScrollAnimations>
    </>
  );
}
