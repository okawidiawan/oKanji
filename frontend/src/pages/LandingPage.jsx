import React from "react";
import About from "../components/landing/About";
import Cards from "../components/landing/Cards";
import Features from "../components/landing/Features";
import Footer from "../components/landing/Footer";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";

export default function LandingPage() {
  return (
    <main className="h-full sm:w-full w-sm bg-background text-white">
      <Navbar />
      <Hero />
      <Cards />
      <Features />
      <About />
      <Footer />
    </main>
  );
}
