import Feature from "./Feature";
import searchPict from "../../assets/search.png";
import trackPict from "../../assets/trackPict.png";
import kotoba from "../../assets/kotoba.png";

export default function Features() {
  const features = [
    {
      id: 1,
      title: "Smart Kanji Browser",
      description: "Search thousands of kanji by character or meaning. Filter by JLPT level. Get readings, stroke info, and related vocabulary — all without leaving the page.",
      isReversed: false,
      image: searchPict,
    },
    {
      id: 2,
      title: "Vocabulary in Context",
      description: "Kanji don't exist in isolation. oKanji connects each character to real kotoba so you build vocabulary naturally, not in a vacuum.",
      isReversed: true,
      image: kotoba,
    },
    {
      id: 3,
      title: "Personal Progress Tracking",
      description: "Add any kanji to your personal list. Mark it memorized when it clicks. Add a note, set a difficulty rating — because everyone's journey is different.",
      isReversed: false,
      image: trackPict,
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center max-w-7xl mx-auto py-20">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-center">
        Everything you need to actually <br />
        <span className="text-primary">remember</span> kanji.
      </h2>
      {/* <div className="feature-cards flex flex-wrap gap-8 justify-center"> */}
      {features.map((feature) => (
        <Feature key={feature.id} title={feature.title} description={feature.description} isReversed={feature.isReversed} image={feature.image} />
      ))}
      {/* </div> */}
    </div>
  );
}
