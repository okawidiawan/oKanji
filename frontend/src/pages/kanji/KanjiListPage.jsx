import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useKanjiStore from "../../stores/use-kanji-store";

export default function KanjiListPage() {
  const { kanjis, isLoading, error, paging, filters, fetchKanjis, setFilters } = useKanjiStore();
  const [searchTerm, setSearchTerm] = useState(filters.search);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters({ search: searchTerm });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, setFilters]);

  useEffect(() => {
    fetchKanjis(paging.page);
  }, [paging.page, filters]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLevelChange = (level) => {
    setFilters({ level: level === filters.level ? "" : level });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paging.total_page) {
      fetchKanjis(newPage);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanji List</h1>
          <p className="text-gray-400 mt-1">Explore thousands of Kanji characters categorized by JLPT levels.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["N5", "N4", "N3", "N2", "N1"].map((lv) => (
            <button
              key={lv}
              onClick={() => handleLevelChange(lv)}
              className={`cursor-pointer px-4 py-2 rounded-lg font-bold transition-all ${filters.level === lv ? "bg-primary text-background" : "bg-background-lighter text-gray-400 border border-my-border hover:border-primary/50"}`}
            >
              {lv}
            </button>
          ))}
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Search kanji or meaning (e.g., 日 or Sun)..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full bg-background-lighter border border-my-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">{error}</div>}

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
                className={`relative overflow-hidden group aspect-square bg-background-lighter border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  isMemorized
                    ? "border-green-500/30 hover:border-green-500 bg-green-500/5 hover:bg-green-500/10"
                    : isLearning
                      ? "border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10"
                      : "border-my-border hover:border-primary hover:bg-primary/5"
                }`}
              >
                {/* Tracking Indicator */}
                {isLearning && (
                  <span
                    className={`absolute top-0 left-0 p-1.5 rounded-br-lg text-xs font-bold flex items-center gap-1 ${isMemorized ? "bg-green-500 text-background" : "bg-primary/10 text-primary"}`}
                    title={isMemorized ? "Memorized" : "Still Learning"}
                  >
                    {isMemorized ? "✓" : "📖"}
                  </span>
                )}

                <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{kanji.character}</span>
                <span className="text-xs text-gray-400 group-hover:text-secondary transition-colors text-center line-clamp-1 px-2">{kanji.meaning}</span>
                <span className="absolute top-0 right-0 text-sm font-bold text-primary/60 bg-primary/10 px-2.5 py-1.5 rounded uppercase">{kanji.jlptLevel}</span>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500">No kanji found matching the specified criteria.</div>
        )}
      </div>

      {/* Pagination */}
      {paging.total_page > 1 && (
        <footer className="flex justify-center items-center gap-4 pt-8">
          <button onClick={() => handlePageChange(paging.page - 1)} disabled={paging.page === 1} className="p-3 bg-background-lighter border border-my-border rounded-xl disabled:opacity-30 hover:border-primary transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-gray-400 font-medium">
            Page <span className="text-primary">{paging.page}</span> from {paging.total_page}
          </div>

          <button
            onClick={() => handlePageChange(paging.page + 1)}
            disabled={paging.page === paging.total_page}
            className="p-3 bg-background-lighter border border-my-border rounded-xl disabled:opacity-30 hover:border-primary transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </footer>
      )}
    </div>
  );
}
