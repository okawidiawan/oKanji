import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoMdClose, IoMdCheckmarkCircle, IoMdAlert } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

/**
 * ReviewValidationModal Component
 * Modal tantangan untuk verifikasi hafalan sebelum update review count.
 *
 * @param {boolean} isOpen - Status buka/tutup modal
 * @param {function} onClose - Fungsi untuk menutup modal
 * @param {function} onSuccess - Callback saat jawaban benar
 * @param {object} kanji - Data kanji yang sedang direview
 */
export default function ReviewValidationModal({ isOpen, onClose, onSuccess, kanji }) {
  const [question, setQuestion] = useState({ type: "", label: "", value: "" });
  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");

  // Inisialisasi pertanyaan saat modal dibuka
  useEffect(() => {
    if (isOpen && kanji) {
      const types = [
        { type: "meaning", label: "Meaning", value: kanji.meaning },
        { type: "onyomi", label: "Onyomi", value: kanji.onyomi },
        { type: "kunyomi", label: "Kunyomi", value: kanji.kunyomi },
      ].filter((t) => t.value && t.value.trim() !== ""); // Pastikan field ada isinya

      // Pilih acak satu tipe pertanyaan
      const selected = types[Math.floor(Math.random() * types.length)];
      setQuestion(selected || { type: "meaning", label: "Meaning", value: kanji.meaning });
      setUserAnswer("");
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen, kanji]);

  // Mencegah scroll pada body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setStatus("verifying");

    // Simulasi proses berpikir sebentar agar tidak terlalu instan
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Normalisasi jawaban: trim, lowercase
    const normalizedInput = userAnswer.trim().toLowerCase();

    // Split jawaban benar jika ada koma (misal: "Cut, disconnect")
    // Mendukung koma latin dan jepang
    const correctAnswers = question.value.split(/[,、]/).map((a) => a.trim().toLowerCase());

    if (correctAnswers.includes(normalizedInput)) {
      setStatus("success");
      // Tunggu sebentar agar user bisa melihat status sukses
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } else {
      setStatus("error");
      setErrorMessage("Incorrect answer. Please try again!");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-background border border-my-border w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-up overflow-hidden">
        {/* Glow effect dekoratif */}
        <div className="hidden sm:inline absolute -top-20 -right-20 w-48 h-48 blur-3xl opacity-40 rounded-full bg-primary" />
        <div className="hidden sm:inline absolute -bottom-20 -left-20 w-96 h-96 blur-3xl opacity-10 rounded-full bg-primary" />

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer z-50">
          <IoMdClose size={24} />
        </button>

        <div className="text-center space-y-6 sm:space-y-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Review Challenge</h3>
            <p className="text-gray-400 text-sm">Prove your memory to continue!</p>
          </div>

          {/* Question Box */}
          <div className="p-6 sm:p-8 bg-background-lighter/40 rounded-3xl border border-my-border shadow-inner">
            <div className="text-5xl sm:text-7xl font-bold text-primary mb-4 sm:mb-6">{kanji.character}</div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-secondary-dark uppercase tracking-widest text-center">Question:</div>
              <div className="text-lg text-white font-medium">
                What is the <span className="text-secondary font-bold">{question.label}</span> of this kanji?
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                autoComplete="off"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Type your answer here..."
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-background border ${
                  status === "error" ? "border-red-500/50 ring-2 ring-red-500/20" : "border-my-border focus:ring-2 focus:ring-secondary/30"
                } focus:outline-none text-white text-center text-md sm:text-lg font-medium transition-all placeholder:text-gray-600`}
                disabled={status === "verifying" || status === "success"}
              />

              {/* Status Icons */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {status === "verifying" && <AiOutlineLoading3Quarters className="animate-spin text-secondary" />}
                {status === "success" && <IoMdCheckmarkCircle className="text-green-500 text-2xl" />}
              </div>
            </div>

            {status === "error" && (
              <div className="text-red-500 text-sm font-medium flex items-center justify-center gap-1 animate-shake">
                <IoMdAlert className="text-lg" /> {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={!userAnswer.trim() || status === "verifying" || status === "success"}
              className={`w-full py-3 sm:py-4 rounded-2xl font-black text-background transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 ${
                status === "success" ? "bg-green-500 shadow-green-500/20" : "bg-secondary hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === "verifying" ? "Verifying..." : status === "success" ? "Success!" : "Verify Answer"}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
