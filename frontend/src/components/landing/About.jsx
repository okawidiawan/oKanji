import SectionHeading from "../ui/SectionHeading";

/**
 * Komponen About
 * Menampilkan bagian "Tentang Kami" (About section) yang menjelaskan motivasi
 * di balik pembuatan oKanji. Memiliki latar belakang lingkaran merah dekoratif
 * dengan kartu kaca transparan di atasnya (glassmorphism effect).
 */
export default function About() {
  return (
    <section id="about" className="flex justify-center relative w-full h-auto min-h-[400px] md:h-[800px] py-16 md:py-24 ">
      <div className="red-circle absolute top-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] bg-linear-to-tr from-primary via-primary-dark to-background rounded-full">
        <div className="glass flex flex-col justify-center items-center absolute sm:top-0 top-1/4 sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-1/3 w-full sm:w-[1000px] sm:h-[500px] bg-background/40 backdrop-blur-2xl gap-8 px-4">
          <div className=" sm:absolute relative top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-secondary-dark/50 to-transparent" />
          <div className="sm:flex sm:flex-col sm:gap-8 sm:relative absolute sm:top-0 top-10 sm:translate-y-0">
            <SectionHeading
              subtitle={`Kanji is hard. Not because it's impossible — but because most tools make it feel that way.
oKanji was built out of frustration with flashcard apps that forget context, and study sheets that don't track anything. The idea was simple: one clean place to browse kanji, save the ones you're working on, and actually know if you're making progress.
No gamification gimmicks. No daily streaks to stress over. Just you, the kanji, and a tool that gets out of your way.`}
            >
              Why <span className="text-primary ">oKanji</span> exists.
            </SectionHeading>
            <p className="font-semibold sm:text-lg text-xs italic text-center mt-8">" Built by a learner, for learners "</p>
          </div>
        </div>
      </div>
    </section>
  );
}
