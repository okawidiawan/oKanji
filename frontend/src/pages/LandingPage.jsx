import { useNavigate } from "react-router";
import About from "../components/landing/About";
import Cards from "../components/landing/Cards";
import Features from "../components/landing/Features";
import Footer from "../components/landing/Footer";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";
import useAuthStore from "../stores/use-auth-store";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className="h-full bg-background text-white">
      <Navbar />
      <Hero />
      <Cards />
      <Features />
      <About />
      <Footer />
    </main>
  );
}
