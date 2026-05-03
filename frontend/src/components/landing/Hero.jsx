import { NavLink } from "react-router";

export default function Hero() {
  return (
    <div className="hero flex flex-col justify-center items-center min-h-[70vh]">
      <div className="w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-widest leading-14 mb-4">
          <span className="text-primary">Finally</span>
          <br />
          Kanji That Sticks<span className="text-primary">.</span>
        </h1>
        <h2 className="text-lg tracking-wide text-secondary-dark mb-8">
          oKanji is your personal kanji companion, browse by JLPT level, track what you've memorized, and learn vocabulary in context. No overwhelm, just progress, keep sticks.
        </h2>
        <NavLink className="text-lg font-semibold tracking-widest bg-primary px-6 py-3 rounded-full">Let's Begin</NavLink>
      </div>
    </div>
  );
}
