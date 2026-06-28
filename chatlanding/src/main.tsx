import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import LandingLayout from "./App";
import { Hero } from "./sections/Hero";
import { Marquee } from "./sections/Marquee";
import { Features } from "./sections/Features";
import { Stats } from "./sections/Stats";
import { PreviewDeck } from "./sections/PreviewDeck";
import { Showcase } from "./sections/Showcase";
import { HowItWorks } from "./sections/HowItWorks";
import { Testimonials } from "./sections/Testimonials";
import { Pricing } from "./sections/Pricing";
import { FAQ } from "./sections/FAQ";
import { CTA } from "./sections/CTA";
import { Footer } from "./sections/Footer";
import AuthCallback from "./pages/AuthCallback";

function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Features />
      <Stats />
      <PreviewDeck />
      <Showcase />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route index element={<HomePage />} />
          <Route path="auth/callback" element={<AuthCallback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
