import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useUserProgressStore from "../../stores/use-user-progress-store";
import { BsBookmarkCheckFill, BsBookHalf } from "react-icons/bs";
import KanjiGrid from "../../components/ui/KanjiGrid";
import { IoMdBookmark } from "react-icons/io";
import { IoBookmarks } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

export default function UserKanjiListPage() {
  const { userKanjis, isLoading, error, paging, fetchUserKanjis } = useUserProgressStore();

  const [filterMemorized, setFilterMemorized] = useState("all"); // "all", "memorized", "learning"

  const normalizedKanjis = userKanjis.map((item) => ({
    ...item.kanji,
    userKanjis: [item],
  }));

  const myEmptyMessage = (
    <div className="flex flex-col items-center gap-4">
      <p>No kanji found in your collection.</p>
      <Link to="/kanji" className="...">
        Explore Kanji List
      </Link>
    </div>
  );

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
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-mono uppercase tracking-wider">Personal Progress</span>
          </h1>
          <p className="text-gray-400 mt-1">Track and review the Kanji characters you are currently focusing on.</p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 bg-background-lighter p-1.5 rounded-xl border border-my-border">
          {[
            { id: "all", label: "All", icon: null },
            { id: "memorized", label: "Memorized", icon: <IoCheckmarkDone className="text-2xl text-green-600" /> },
            { id: "learning", label: "Learning", icon: <IoBookmarks className="text-md text-primary/80" /> },
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${filterMemorized === tab.id ? "bg-secondary/80 text-background shadow-md shadow-primary/20" : "text-gray-400 hover:text-white"}`}
            >
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">{error}</div>}

      {/* Kanji Grid */}
      <KanjiGrid kanjis={normalizedKanjis} isLoading={isLoading} emptyMessage={myEmptyMessage} />

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
