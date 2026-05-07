import Card from "./Card";
import collection from "../../assets/collection.svg";
import check from "../../assets/check.svg";
import context from "../../assets/context.svg";

export default function Cards() {
  const cards = [
    {
      id: 1,
      icon: collection,
      title: "Browse by Level",
      description: "From N5 to N1 — explore kanji at your own pace, filtered exactly how you need.",
    },
    {
      id: 2,
      icon: check,
      title: "Track Your Progress",
      description: "Mark kanji as memorized, add notes, and rate your difficulty. Your study list, your rules.",
    },
    {
      id: 3,

      icon: context,
      title: "Learn in Context",
      description: "Every kanji comes with real kotoba. Learn words the way they actually appear in Japanese.",
    },
  ];
  return (
    <section className="flex justify-center max-w-7xl mx-auto px-4 py-20 relative z-10 mb-80" id="cards">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up [animation-delay:1400ms] opacity-0 relative z-10">
        {cards.map((card) => (
          <Card key={card.id} title={card.title} description={card.description} icon={card.icon} />
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[500px] bg-primary/30 rounded-full z-0 blur-[120px]"></div>
    </section>
  );
}
