import Feature from "./Feature";
import searchPict from "../../assets/search.png";
import trackPict from "../../assets/trackPict.png";
import kotoba from "../../assets/kotoba.png";
import SectionHeading from "../ui/SectionHeading";

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
    <section className="flex flex-col justify-center items-center max-w-7xl mx-auto py-20" id="features">
      <SectionHeading>
        Everything you need to actually <br /> <span className="text-primary">remember</span> kanji.
      </SectionHeading>
      {features.map((feature) => (
        <Feature key={feature.id} title={feature.title} description={feature.description} isReversed={feature.isReversed} image={feature.image} />
      ))}
      {/* </div> */}
    </section>
  );
}
