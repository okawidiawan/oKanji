import About from "../components/landing/About";
import Cards from "../components/landing/Cards";
import Features from "../components/landing/Features";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";

export default function LandingPage() {
  return (
    <main className="h-[5000px] bg-background text-white">
      <Navbar />
      <Hero />
      <Cards />
      <Features />
      <About />
    </main>
  );
}
