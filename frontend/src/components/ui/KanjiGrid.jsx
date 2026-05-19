import { Link } from "react-router-dom";
import { IoMdBookmark } from "react-icons/io";
import { FaCheck } from "react-icons/fa";

export default function KanjiGrid({ kanjis, isLoading, emptyMessage = "No kanji found." }) {
  return (
    <>
      {/* Kanji Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square bg-background-lighter border border-my-border rounded-2xl animate-pulse" />)
        ) : kanjis.length > 0 ? (
          kanjis.map((kanji) => {
            const isLearning = kanji.userKanjis && kanji.userKanjis.length > 0;
            const isMemorized = isLearning && kanji.userKanjis[0].isMemorized === true;

            return (
              <Link
                key={kanji.id}
                to={`/kanji/${kanji.id}`}
                className={`relative overflow-hidden group aspect-square bg-background-lighter border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-500 ${
                  isMemorized
                    ? "border-green-800 hover:border-green-700 bg-green-950 hover:bg-green-900"
                    : isLearning
                      ? "border-primary/30 hover:border-primary bg-red-950 hover:bg-primary-dark"
                      : "border-my-border hover:border-secondary hover:bg-primary/5"
                }`}
              >
                {/* Tracking Indicator */}
                {isLearning && (
                  <span
                    className={`absolute font-bold flex items-center opacity-40 ${isMemorized ? "text-green-800 py-3 px-1 rounded-sm bg-green-500 text-xl -top-1 left-3" : "text-primary text-5xl -top-2 left-1"}`}
                    title={isMemorized ? "Memorized" : "Still Learning"}
                  >
                    {isMemorized ? <FaCheck /> : <IoMdBookmark />}
                  </span>
                )}

                <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{kanji.character}</span>

                <span className="text-xs text-gray-400 group-hover:text-secondary transition-colors text-center line-clamp-1 px-2">{kanji.meaning}</span>

                <span className="absolute top-0 right-0 text-sm font-bold text-secondary/60 bg-background rounded-bl-lg px-2.5 py-1.5 uppercase">{kanji.jlptLevel}</span>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500">No kanji found matching the specified criteria.</div>
        )}
      </div>
    </>
  );
}
