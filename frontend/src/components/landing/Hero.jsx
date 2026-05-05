import { NavLink } from "react-router";

export default function Hero() {
  return (
    <section className="flex justify-center items-center min-h-[70vh] relative" id="hero">
      <div className="w-7xl text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-4 z-10 relative">
          <span className="text-primary animate-fade-up [animation-delay:600ms] opacity-0 inline-block">Finally</span>
          <br />
          <span className="animate-fade-up [animation-delay:800ms] opacity-0 inline-block">
            Kanji That Sticks
            <span className="text-primary">.</span>
          </span>
        </h1>
        <h2 className="text-lg tracking-normal text-secondary-dark mb-8 w-2xl animate-fade-up [animation-delay:1200ms] opacity-0 z-10 relative">
          oKanji is your personal kanji companion, browse by JLPT level, track what you've memorized, and learn vocabulary in context.
          <br />
          No overwhelm, just progress, keep sticks.
        </h2>
        <NavLink className="text-lg font-semibold tracking-widest border border-primary text-primary hover:bg-primary hover:text-secondary px-6 py-3 rounded-full transition-all duration-500 hover:shadow-[0_0_20px_rgba(243,78,78,0.4)] animate-fade-up [animation-delay:1400ms] opacity-0 z-10 relative">
          Let's Begin
        </NavLink>
      </div>
    </section>
  );
}
