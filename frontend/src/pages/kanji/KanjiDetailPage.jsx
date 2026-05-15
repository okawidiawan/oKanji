import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useKanjiStore from "../../stores/use-kanji-store";
import useUserProgressStore from "../../stores/use-user-progress-store";
import useAuthStore from "../../stores/use-auth-store";
import { IoMdAddCircleOutline, IoMdTrash } from "react-icons/io";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { BsBookmarkPlusFill } from "react-icons/bs";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function KanjiDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { currentKanji, fetchKanjiDetail, isLoading: isKanjiLoading } = useKanjiStore();
  const { currentProgressDetail, fetchProgressDetail, quickAddKanji, memorizeKanji, removeKanjiProgress, addKotobaProgress, removeKotobaProgress, toggleKotobaMemorized, isLoading: isProgressLoading } = useUserProgressStore();

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    type: "danger",
    icon: null,
    onConfirm: () => {},
  });

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
      await memorizeKanji(id, { isMemorized: !currentProgressDetail.isMemorized });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleHafalkan = () => {
    if (!currentProgressDetail || !currentProgressDetail.isMemorized) return;
    setModalConfig({
      isOpen: true,
      title: "Finished Reviewing?",
      message: "This kanji's review count will increase. Make sure you have thoroughly reviewed it today!",
      confirmText: "Yes, Finished",
      type: "primary",
      icon: <BsBookmarkPlusFill />,
      onConfirm: async () => {
        setIsActionLoading(true);
        try {
          // Delay sengaja untuk feel interaksi yang lebih baik
          await new Promise((resolve) => setTimeout(resolve, 500));
          const newReviewCount = (currentProgressDetail.reviewCount || 0) + 1;
          await memorizeKanji(id, { reviewCount: newReviewCount });
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleRemoveKanji = () => {
    setModalConfig({
      isOpen: true,
      title: "Stop Learning Kanji?",
      message: "All learning progress, memorization status, and notes for this kanji will be permanently deleted.",
      confirmText: "Yes, Delete All",
      type: "danger",
      icon: <IoMdTrash />,
      onConfirm: async () => {
        setIsActionLoading(true);
        try {
          await removeKanjiProgress(id);
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleToggleKotoba = async (kotobaId, currentIsMemorized) => {
    await toggleKotobaMemorized(kotobaId, { isMemorized: !currentIsMemorized });
  };

  const handleAddKotoba = async (kotobaId) => {
    await addKotobaProgress(kotobaId);
  };

  const handleRemoveKotoba = (kotobaId) => {
    setModalConfig({
      isOpen: true,
      title: "Remove Vocabulary Progress?",
      message: "Learning progress for this vocabulary will be removed from your list.",
      confirmText: "Yes, Remove",
      type: "danger",
      icon: null,
      onConfirm: async () => {
        await removeKotobaProgress(kotobaId);
      },
    });
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
    <div className="space-y-10 max-w-5xl animate-fade-up flex flex-col justify-center items-center md:items-stretch mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch mb-4">
        <div className="flex flex-col gap-4">
          <div className="shrink-0 w-64 h-64 rounded-3xl flex items-center justify-center text-[10rem] font-bold shadow-2xl text-secondary border border-my-border">{currentKanji.character}</div>
          {/* Add Kanji Actions */}
          <div className="w-64 flex justify-center">
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                {!currentProgressDetail ? (
                  <button
                    onClick={handleQuickAdd}
                    disabled={isActionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-background font-black rounded-2xl hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BsBookmarkPlusFill className="text-2xl" />
                    <span>{isActionLoading ? "Adding..." : "Start Learning"}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md p-1.5 rounded-2xl border border-my-border animate-fade-in">
                    {/* Tombol Utama: Hafalkan */}
                    <button
                      onClick={handleHafalkan}
                      disabled={isActionLoading || !currentProgressDetail.isMemorized}
                      title={!currentProgressDetail.isMemorized ? "Memorize this kanji first to increase review count" : "Add Review Count"}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black bg-secondary text-background transition-all shadow-lg shadow-white/10 ${
                        isActionLoading || !currentProgressDetail.isMemorized ? "opacity-30 cursor-not-allowed" : "hover:opacity-90 hover:scale-105 active:scale-95 cursor-pointer"
                      }`}
                    >
                      <span className="text-sm uppercase tracking-wider">{isActionLoading ? "..." : "Review"}</span>
                    </button>

                    {/* Tombol Status Hafalan (Toggle Terpisah) */}
                    <button
                      onClick={handleToggleMemorized}
                      disabled={isActionLoading}
                      title={currentProgressDetail.isMemorized ? "Mark as Not Memorized" : "Mark as Memorized"}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                        currentProgressDetail.isMemorized ? "bg-green-500 text-background border-green-500 shadow-lg shadow-green-500/20" : "bg-background-lighter text-gray-500 border-my-border hover:text-primary hover:border-primary"
                      } active:scale-95 disabled:opacity-50`}
                    >
                      {currentProgressDetail.isMemorized ? <IoIosCheckmarkCircleOutline className="text-xl" /> : <IoMdAddCircleOutline className="text-xl" />}
                    </button>

                    {/* Tombol Batal Pelajari */}
                    <button
                      onClick={handleRemoveKanji}
                      disabled={isActionLoading}
                      title="Stop Learning"
                      className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      <IoMdTrash className="text-xl" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="grow flex flex-col justify-center space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center w-full justify-center md:justify-start gap-4">
                {/* JLPT Level */}
                <span className="px-3 py-1 bg-primary text-background font-black rounded-lg text-sm uppercase">{currentKanji.jlptLevel}</span>

                {/* Radikal */}
                {currentKanji.radical && <span className="text-gray-500 text-sm">Radikal: {currentKanji.radical}</span>}
              </div>
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
      <section className="space-y-6 ">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 bg-background-lighter rounded-lg flex items-center justify-center text-primary text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.993 7.993 0 002 12a7.998 7.998 0 007 7.917V4.804zm2 0v15.113A7.998 7.998 0 0018 12a7.993 7.993 0 00-7-7.196z" />
              </svg>
            </span>
            Related Vocabulary
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const kotobaList = currentKanji.kotoba || [];
            const userKotobaMap = {};

            if (currentProgressDetail?.kanji?.kotoba) {
              currentProgressDetail.kanji.kotoba.forEach((k) => {
                if (k.userKotoba && k.userKotoba.length > 0) {
                  userKotobaMap[k.id] = k.userKotoba[0];
                }
              });
            }

            return kotobaList.length > 0 ? (
              kotobaList.map((word) => {
                const userKotoba = userKotobaMap[word.id] || null;
                const isMemorized = userKotoba?.isMemorized || false;

                return (
                  <div
                    key={word.id}
                    className={`group p-4 bg-background-lighter border border-my-border rounded-2xl flex items-center justify-evenly transition-all hover:border-secondary ${isMemorized ? "border-green-500/30 bg-green-500/5" : ""}`}
                  >
                    <div className="space-y-1 w-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-secondary">{word.word}</span>
                          <span className="text-md text-secondary-dark font-mono">[{word.reading}]</span>
                        </div>
                        {isAuthenticated && (
                          <div className="flex items-center gap-1">
                            {userKotoba ? (
                              <>
                                <button
                                  onClick={() => handleToggleKotoba(word.id, isMemorized)}
                                  title={isMemorized ? "Mark as Not Memorized" : "Mark as Memorized"}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                    isMemorized ? "bg-green-500 text-background shadow-md shadow-green-500/20" : "bg-background-lighter border border-my-border text-gray-500 hover:text-primary hover:border-primary"
                                  } hover:scale-105 active:scale-95`}
                                >
                                  <IoIosCheckmarkCircleOutline className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveKotoba(word.id)}
                                  title="Remove Progress"
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer border border-my-border"
                                >
                                  <IoMdTrash className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAddKotoba(word.id)}
                                disabled={!currentProgressDetail}
                                title={!currentProgressDetail ? "Start learning this kanji first to track vocabulary" : "Add to Memorization List"}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center bg-background-lighter border border-my-border transition-all ${
                                  !currentProgressDetail ? "opacity-30 cursor-not-allowed text-gray-600" : "text-gray-500 hover:text-primary hover:border-primary cursor-pointer hover:scale-105 active:scale-95"
                                }`}
                              >
                                <IoMdAddCircleOutline className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">{word.meaning}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 text-center text-gray-500 bg-background-lighter rounded-2xl border border-dashed border-my-border">No vocabulary added for this kanji yet.</div>
            );
          })()}
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
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Difficulty Level</div>
            <div className="text-3xl font-black text-primary">{currentProgressDetail.difficulty || "-"}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Last Reviewed</div>
            <div className="text-sm font-medium text-white">{currentProgressDetail.lastReviewed ? new Date(currentProgressDetail.lastReviewed).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Never"}</div>
          </div>
        </section>
      )}

      {/* Dynamic Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
        icon={modalConfig.icon}
      />
    </div>
  );
}
