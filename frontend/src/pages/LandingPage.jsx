import Cards from "../components/landing/Cards";
import Features from "../components/landing/Features";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";

export default function LandingPage() {
  return (
    <div className="h-[2000px]">
      <Navbar />
      <Hero />
      <Cards />
      <Features />
    </div>
  );
}
