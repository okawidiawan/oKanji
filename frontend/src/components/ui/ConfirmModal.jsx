import { createPortal } from "react-dom";
import { IoMdAlert, IoMdTrash } from "react-icons/io";
import { RiLogoutCircleRLine } from "react-icons/ri";

/**
 * ConfirmModal Component
 * Modal konfirmasi premium dengan backdrop blur dan animasi.
 *
 * @param {boolean} isOpen - Status buka/tutup modal
 * @param {function} onClose - Fungsi untuk menutup modal
 * @param {function} onConfirm - Fungsi yang dijalankan saat klik konfirmasi
 * @param {string} title - Judul modal
 * @param {string} message - Pesan penjelasan
 * @param {string} confirmText - Teks pada tombol konfirmasi
 * @param {string} type - Tipe modal ('danger', 'warning', 'info')
 * @param {React.ReactNode} icon - Icon kustom (opsional)
 */
export default function ConfirmModal({ isOpen, onClose, onConfirm, title = "Are you sure?", message = "This action cannot be undone.", confirmText = "Yes, Continue", type = "danger", icon }) {
  if (!isOpen) return null;

  // Tentukan warna berdasarkan tipe
  const colors = {
    primary: "text-primary bg-primary/10",
    danger: "text-primary bg-primary/10",
    warning: "text-primary bg-primary/10",
    info: "text-primary bg-primary/10",
  };

  const confirmButtonColors = {
    primary: "bg-primary hover:bg-primary-dark",
    danger: "bg-primary hover:bg-primary-dark",
    warning: "bg-primary hover:bg-primary-dark",
    info: "bg-primary hover:bg-primary-dark",
  };

  // Render modal menggunakan portal ke body
  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-background border border-my-border w-full max-w-sm rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-up overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 rounded-full bg-primary" />

        <div className="text-center space-y-6">
          {/* Icon Section */}
          <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${colors[type] || colors.danger}`}>{icon || (type === "danger" ? <IoMdTrash /> : <IoMdAlert />)}</div>

          {/* Text Section */}
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed px-2">{message}</p>
          </div>

          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button onClick={onClose} className="flex-1 order-2 sm:order-1 px-4 py-3.5 rounded-2xl border border-my-border hover:bg-white/5 transition-all font-bold text-gray-300 cursor-pointer active:scale-95">
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 order-1 sm:order-2 px-4 py-3.5 rounded-2xl text-background font-black transition-all shadow-lg cursor-pointer active:scale-95 ${confirmButtonColors[type] || confirmButtonColors.danger}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
