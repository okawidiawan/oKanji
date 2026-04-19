// TODO: Halaman daftar kanji dengan pagination dan filter
export default function KanjiListPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Daftar Kanji</h1>
        {/* <JlptFilter /> */}
      </header>
      {/* <KanjiGrid /> */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-background-lighter border border-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
      {/* <Pagination /> */}
    </div>
  );
}
