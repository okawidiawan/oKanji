import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useUserProgressStore from "../../stores/use-user-progress-store";
import { BsBookmarkCheckFill, BsBookHalf } from "react-icons/bs";

export default function UserKanjiListPage() {
  const { userKanjis, isLoading, error, paging, fetchUserKanjis } = useUserProgressStore();
  const [filterMemorized, setFilterMemorized] = useState("all"); // "all", "memorized", "learning"

  useEffect(() => {
    // Convert filter string to boolean or undefined
    const params = { page: paging.page || 1 };
    if (filterMemorized === "memorized") params.isMemorized = true;
    if (filterMemorized === "learning") params.isMemorized = false;
    
    fetchUserKanjis(params);
  }, [paging.page, filterMemorized]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paging.total_page) {
      const params = { page: newPage };
      if (filterMemorized === "memorized") params.isMemorized = true;
      if (filterMemorized === "learning") params.isMemorized = false;
      fetchUserKanjis(params);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span>My Kanji Collection</span>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-mono uppercase tracking-wider">
              Personal Progress
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Track and review the Kanji characters you are currently focusing on.</p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 bg-background-lighter p-1.5 rounded-xl border border-my-border">
          {[
            { id: "all", label: "All", icon: null },
            { id: "memorized", label: "Memorized", icon: <BsBookmarkCheckFill className="text-green-500" /> },
            { id: "learning", label: "Learning", icon: <BsBookHalf className="text-primary" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                // Reset page to 1 on filter change
                if (filterMemorized !== tab.id) {
                  setFilterMemorized(tab.id);
                  // Manually fetch page 1 immediately for smooth UI transition
                  const params = { page: 1 };
                  if (tab.id === "memorized") params.isMemorized = true;
                  if (tab.id === "learning") params.isMemorized = false;
                  fetchUserKanjis(params);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                filterMemorized === tab.id
                  ? "bg-primary text-background shadow-md shadow-primary/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">{error}</div>}

      {/* Kanji Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-background-lighter border border-my-border rounded-2xl animate-pulse" />
          ))
        ) : userKanjis && userKanjis.length > 0 ? (
          userKanjis.map((item) => {
            const kanji = item.kanji || {};
            return (
              <Link
                key={item.kanjiId}
                to={`/kanji/${item.kanjiId}`}
                className={`relative overflow-hidden group aspect-square bg-background-lighter border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  item.isMemorized
                    ? "border-green-500/30 hover:border-green-500 bg-green-500/5 hover:bg-green-500/10"
                    : "border-my-border hover:border-primary hover:bg-primary/5"
                }`}
              >
                {/* Corner Status Badge */}
                <span
                  className={`absolute top-0 left-0 p-1.5 rounded-br-lg text-xs font-bold flex items-center gap-1 ${
                    item.isMemorized ? "bg-green-500 text-background" : "bg-primary/10 text-primary"
                  }`}
                  title={item.isMemorized ? "Memorized" : "Still Learning"}
                >
                  {item.isMemorized ? "✓" : "📖"}
                </span>

                {/* Review Count Badge */}
                <span
                  className="absolute bottom-2 right-2 text-[10px] font-mono text-gray-400 group-hover:text-white bg-background px-1.5 py-0.5 rounded border border-my-border"
                  title="Total Reviews"
                >
                  ★ {item.reviewCount || 0}
                </span>

                {/* JLPT Level */}
                {kanji.jlptLevel && (
                  <span className="absolute top-0 right-0 text-xs font-bold text-primary/60 bg-primary/10 px-2 py-1 rounded uppercase">
                    {kanji.jlptLevel}
                  </span>
                )}

                <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {kanji.character}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-primary transition-colors text-center line-clamp-1 px-2">
                  {kanji.meaning}
                </span>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-background-lighter rounded-3xl border border-dashed border-my-border p-8">
            <p className="text-gray-400 text-lg">No kanji found in your personal collection for this filter.</p>
            <Link
              to="/kanji"
              className="px-6 py-2.5 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            >
              Explore Kanji List
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paging && paging.total_page > 1 && (
        <footer className="flex justify-center items-center gap-4 pt-8">
          <button
            onClick={() => handlePageChange(paging.page - 1)}
            disabled={paging.page === 1}
            className="p-3 bg-background-lighter border border-my-border rounded-xl disabled:opacity-30 hover:border-primary transition-all cursor-pointer"
          >
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
            className="p-3 bg-background-lighter border border-my-border rounded-xl disabled:opacity-30 hover:border-primary transition-all cursor-pointer"
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
