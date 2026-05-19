import { useEffect, useState } from "react";
import useKanjiStore from "../../stores/use-kanji-store";
import KanjiGrid from "../../components/ui/KanjiGrid";
import { TiDeleteOutline } from "react-icons/ti";
import useDebounce from "../../hooks/useDebounce";

export default function KanjiListPage() {
  const { kanjis, isLoading, error, paging, filters, fetchKanjis, setFilters } = useKanjiStore();
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  useEffect(() => {
    fetchKanjis(paging.page);
  }, [paging.page, filters]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLevelChange = (level) => {
    setFilters({ level: level === filters.level ? "" : level });
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split("|");
    setFilters({ sort_by: sortBy, sort_order: sortOrder });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paging.total_page) {
      fetchKanjis(newPage);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up ">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanji List</h1>
          <p className="text-gray-400 mt-1">Explore thousands of Kanji characters categorized by JLPT levels.</p>
        </div>

        <div className="flex flex-wrap items-center gap-8">
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

          <select
            value={`${filters.sort_by || "jlptLevel"}|${filters.sort_order || "asc"}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className="cursor-pointer bg-background-lighter text-gray-400 border border-my-border hover:border-primary/50 rounded-lg px-4 py-2 font-bold focus:outline-none transition-all"
          >
            <option value="jlptLevel|asc">JLPT: N5 → N1</option>
            <option value="jlptLevel|desc">JLPT: N1 → N5</option>
            <option value="priority|asc">Priority: Recommended Order</option>
            <option value="priority|desc">Priority: Reverse Order</option>
          </select>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Search kanji or meaning (e.g., 日 or Sun)..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full bg-background-lighter border border-my-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all md:text-lg text-xs"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm("")}>
            <TiDeleteOutline className="absolute text-xl right-14 top-1/2 -translate-y-1/2 text-secondary-dark/80 hover:text-red-500 transition-colors cursor-pointer" />
          </button>
        )}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">{error}</div>}

      <KanjiGrid kanjis={kanjis} isLoading={isLoading} />

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
