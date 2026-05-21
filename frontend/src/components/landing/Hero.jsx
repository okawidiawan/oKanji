import { Link as RouterLink } from "react-router";

/**
 * Komponen Hero
 * Menampilkan bagian utama halaman (Hero section) dengan judul besar, sub-judul,
 * dan tombol ajakan bertindak (CTA). Menggunakan animasi masuk fade-up secara bertahap.
 */
export default function Hero() {
  return (
    <section className="flex justify-center items-center min-h-[70vh] py-16 md:py-24 relative" id="hero">
      <div className="w-full max-w-7xl px-4 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-4 z-10 relative">
          <span className="text-primary animate-fade-up [animation-delay:600ms] opacity-0 inline-block">Finally</span>
          <br />
          <span className="animate-fade-up [animation-delay:800ms] opacity-0 inline-block">
            Kanji That Sticks
            <span className="text-primary">.</span>
          </span>
        </h1>
        <h3 className="text-md tracking-normal text-secondary-dark mb-8 w-full md:w-2xl animate-fade-up [animation-delay:1200ms] opacity-0 z-10 relative">
          oKanji is your personal kanji companion, browse by JLPT level, track what you've memorized, and learn vocabulary in context.
          <br />
          No overwhelm, just progress, keep sticks.
        </h3>
        <RouterLink
          to="/auth/login"
          className="text-lg font-semibold tracking-widest border border-primary text-primary hover:bg-primary hover:text-secondary px-6 py-3 rounded-full transition-all duration-500 hover:shadow-[0_0_20px_rgba(243,78,78,0.4)] animate-fade-up [animation-delay:1400ms] opacity-0 z-10 relative"
        >
          Let's Begin
        </RouterLink>
      </div>
    </section>
  );
}
