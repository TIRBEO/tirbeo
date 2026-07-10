import { CityScene } from "../components/CityScene";

export default function LandingPage() {
  return (
    <>
      <CityScene />
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 text-xs font-mono tracking-[0.2em] text-white/20 z-20 animate-pulse">
        SCROLL TO EXPLORE
      </div>
    </>
  );
}
