import SectionHeading from "../ui/SectionHeading";

export default function About() {
  return (
    <section id="about" className="flex justify-center relative w-full h-[800px]">
      <div className="red-circle absolute top-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-primary via-primary-dark to-background rounded-full">
        <div className="glass flex flex-col justify-center items-center absolute left-1/2 -translate-x-1/2 translate-y-1/3 w-[1000px] h-[500px] bg-background/40 backdrop-blur-2xl gap-8">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary-dark/50 to-transparent"></div>

          <SectionHeading
            subtitle={`Kanji is hard. Not because it's impossible — but because most tools make it feel that way.
oKanji was built out of frustration with flashcard apps that forget context, and study sheets that don't track anything. The idea was simple: one clean place to browse kanji, save the ones you're working on, and actually know if you're making progress.
No gamification gimmicks. No daily streaks to stress over. Just you, the kanji, and a tool that gets out of your way.`}
          >
            Why <span className="text-primary ">oKanji</span> exists.
          </SectionHeading>
          <p className="font-semibold text-lg italic">" Built by a learner, for learners "</p>
        </div>
      </div>
    </section>
  );
}
