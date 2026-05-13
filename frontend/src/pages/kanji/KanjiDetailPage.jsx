import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useKanjiStore from "../../stores/use-kanji-store";
import useUserProgressStore from "../../stores/use-user-progress-store";
import useAuthStore from "../../stores/use-auth-store";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline, IoMdTrash, IoMdCloseCircleOutline } from "react-icons/io";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { BsBookmarkPlusFill } from "react-icons/bs";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function KanjiDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { currentKanji, fetchKanjiDetail, isLoading: isKanjiLoading } = useKanjiStore();
  const { 
    currentProgressDetail, 
    fetchProgressDetail, 
    quickAddKanji, 
    memorizeKanji, 
    removeKanjiProgress,
    addKotobaProgress,
    removeKotobaProgress,
    toggleKotobaMemorized, 
    isLoading: isProgressLoading 
  } = useUserProgressStore();

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showKanjiConfirm, setShowKanjiConfirm] = useState(false);
  const [showKotobaConfirm, setShowKotobaConfirm] = useState(false);
  const [targetKotobaId, setTargetKotobaId] = useState(null);

  useEffect(() => {
    if (id) {
      fetchKanjiDetail(id);
      if (isAuthenticated) {
        fetchProgressDetail(id);
      }
    }
  }, [id, isAuthenticated]);

  const handleQuickAdd = async () => {
    setIsActionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await quickAddKanji(id);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleMemorized = async () => {
    if (!currentProgressDetail) return;
    setIsActionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await memorizeKanji(id, !currentProgressDetail.isMemorized);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveKanji = () => {
    setShowKanjiConfirm(true);
  };

  const handleActualRemoveKanji = async () => {
    setIsActionLoading(true);
    try {
      await removeKanjiProgress(id);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleKotoba = async (kotobaId, currentIsMemorized) => {
    await toggleKotobaMemorized(kotobaId, !currentIsMemorized);
  };

  const handleAddKotoba = async (kotobaId) => {
    await addKotobaProgress(kotobaId);
  };

  const handleRemoveKotoba = (kotobaId) => {
    setTargetKotobaId(kotobaId);
    setShowKotobaConfirm(true);
  };

  const handleActualRemoveKotoba = async () => {
    if (!targetKotobaId) return;
    await removeKotobaProgress(targetKotobaId);
    setTargetKotobaId(null);
  };

  if (isKanjiLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentKanji) {
    return <div className="text-center py-20 text-gray-500">Kanji Not Found</div>;
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-fade-up">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-stretch">
        <div className="shrink-0 w-64 h-64 rounded-3xl flex items-center justify-center text-[10rem] font-bold shadow-2xl text-secondary border border-my-border">{currentKanji.character}</div>

        <div className="grow flex flex-col justify-center space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                {/* JLPT Level */}
                <span className="px-3 py-1 bg-primary text-background font-black rounded-lg text-sm uppercase">{currentKanji.jlptLevel}</span>

                {/* Radikal */}
                {currentKanji.radical && <span className="text-gray-500 text-sm">Radikal: {currentKanji.radical}</span>}
              </div>

              {/* Add Kanji Actions */}
              {isAuthenticated && (
                <div className="flex items-center gap-4">
                  {!currentProgressDetail ? (
                    <button 
                      onClick={handleQuickAdd} 
                      disabled={isActionLoading} 
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-background font-black rounded-2xl hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BsBookmarkPlusFill className="text-xl" />
                      <span>{isActionLoading ? "Menambahkan..." : "Mulai Belajar"}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-background-lighter p-1.5 rounded-2xl border border-my-border animate-fade-in">
                      <button
                        onClick={handleToggleMemorized}
                        disabled={isActionLoading}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                          currentProgressDetail.isMemorized 
                            ? "bg-green-500 text-background shadow-lg shadow-green-500/20" 
                            : "bg-primary text-background shadow-lg shadow-primary/20"
                        } hover:opacity-90 active:scale-95 disabled:opacity-50`}
                      >
                        {currentProgressDetail.isMemorized ? <IoIosCheckmarkCircleOutline className="text-xl" /> : <IoMdAddCircleOutline className="text-xl" />}
                        <span className="text-sm">{currentProgressDetail.isMemorized ? "Sudah Hafal" : "Belum Hafal"}</span>
                      </button>

                      <button
                        onClick={handleRemoveKanji}
                        disabled={isActionLoading}
                        title="Batal Pelajari"
                        className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        <IoMdTrash className="text-xl" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <h1 className="text-5xl font-extrabold text-white">{currentKanji.meaning}</h1>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto md:mx-0">
            <div className="space-y-1">
              <div className="text-xs font-bold text-primary uppercase tracking-widest">Onyomi</div>
              <div className="text-xl text-white font-medium">{currentKanji.onyomi}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-primary uppercase tracking-widest">Kunyomi</div>
              <div className="text-xl text-white font-medium">{currentKanji.kunyomi}</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-my-border" />

      {/* Kotoba Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 bg-background-lighter rounded-lg flex items-center justify-center text-primary text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.993 7.993 0 002 12a7.998 7.998 0 007 7.917V4.804zm2 0v15.113A7.998 7.998 0 0018 12a7.993 7.993 0 00-7-7.196z" />
              </svg>
            </span>
            Kosakata Terkait
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentKanji.kotoba && currentKanji.kotoba.length > 0 ? (
            currentKanji.kotoba.map((word) => {
              const userKotoba = word.userKotoba?.[0];
              const isMemorized = userKotoba?.isMemorized || false;

              return (
                <div
                  key={word.id}
                  className={`group p-5 bg-background-lighter border border-my-border rounded-2xl flex items-center justify-between transition-all hover:border-primary/50 ${isMemorized ? "border-green-500/30 bg-green-500/5" : ""}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">{word.word}</span>
                      <span className="text-sm text-gray-500 font-mono">[{word.reading}]</span>
                    </div>
                    <div className="text-gray-400 text-sm">{word.meaning}</div>
                  </div>

                  {isAuthenticated && (
                    <div className="flex items-center gap-1.5">
                      {userKotoba ? (
                        <>
                          <button
                            onClick={() => handleToggleKotoba(word.id, isMemorized)}
                            title={isMemorized ? "Tandai Belum Hafal" : "Tandai Sudah Hafal"}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isMemorized 
                                ? "bg-green-500 text-background shadow-md shadow-green-500/20" 
                                : "bg-background-lighter border border-my-border text-gray-500 hover:text-primary hover:border-primary"
                            } hover:scale-105 active:scale-95`}
                          >
                            <IoIosCheckmarkCircleOutline className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveKotoba(word.id)}
                            title="Hapus Progress"
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          >
                            <IoMdTrash className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddKotoba(word.id)}
                          title="Tambah ke Hafalan"
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-background-lighter border border-my-border text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <IoMdAddCircleOutline className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-10 text-center text-gray-500 bg-background-lighter rounded-2xl border border-dashed border-my-border">Belum ada kosakata yang ditambahkan untuk kanji ini.</div>
          )}
        </div>
      </section>

      {/* Progress Stats Section (Optional/Extra) */}
      {isAuthenticated && currentProgressDetail && (
        <section className="bg-background-lighter p-8 rounded-3xl border border-my-border grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center space-y-1">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Review</div>
            <div className="text-3xl font-black text-white">{currentProgressDetail.reviewCount || 0}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Tingkat Kesulitan</div>
            <div className="text-3xl font-black text-primary">{currentProgressDetail.difficulty || "-"}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Terakhir Dipelajari</div>
            <div className="text-sm font-medium text-white">
              {currentProgressDetail.lastReviewed ? new Date(currentProgressDetail.lastReviewed).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum pernah"}
            </div>
          </div>
        </section>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showKanjiConfirm}
        onClose={() => setShowKanjiConfirm(false)}
        onConfirm={handleActualRemoveKanji}
        title="Batal Pelajari Kanji?"
        message="Seluruh progres belajar, status hafalan, dan catatan untuk kanji ini akan dihapus secara permanen."
        confirmText="Ya, Hapus Semua"
        type="danger"
        icon={<IoMdTrash />}
      />

      <ConfirmModal
        isOpen={showKotobaConfirm}
        onClose={() => {
          setShowKotobaConfirm(false);
          setTargetKotobaId(null);
        }}
        onConfirm={handleActualRemoveKotoba}
        title="Hapus Progres Kosakata?"
        message="Data progres belajar untuk kosakata ini akan dihapus dari daftar hafalan Anda."
        confirmText="Ya, Hapus"
        type="danger"
      />
    </div>
  );
}
