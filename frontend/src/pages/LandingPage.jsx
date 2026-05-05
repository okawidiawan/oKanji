import Cards from "../components/landing/Cards";
import Features from "../components/landing/Features";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-white">
      <Navbar />
      <Hero />
      <Cards />
      <Features />
    </main>
  );
}
