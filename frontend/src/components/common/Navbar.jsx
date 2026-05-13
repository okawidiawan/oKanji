import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/use-auth-store";
import logoImg from "../../assets/logo.png";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Tambahkan di dalam fungsi Navbar
  const [showConfirm, setShowConfirm] = useState(false);

  // Fungsi dipicu tombol di navbar
  const handleLogoutClick = () => {
    setShowConfirm(true); // Buka modal
  };

  // Fungsi dipicu tombol "Ya" di dalam modal
  const handleActualLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error(error);
    } finally {
      setShowConfirm(false); // Tutup modal
    }
  };

  return (
    <>
      <nav className="border-b sticky z-50 border-my-border bg-transparent backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/kanji" className="text-2xl font-bold text-primary tracking-tighter">
            <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
          </Link>

          {/* Menu Navigasi */}
          <div className="flex items-center gap-6">
            <Link to="/profile" className="hover:text-primary transition-colors">
              Profile
            </Link>
            <Link to="/kanji" className="hover:text-primary transition-colors">
              Kanji List
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              My Kanji
            </Link>

            {/* Info User & Tombol Logout */}
            <div className="flex items-center gap-4 ml-4 border-l border-my-border pl-6">
              <span className="text-sm text-gray-400 hidden sm:inline">
                Hello, <span className="text-white font-medium">{user?.username}</span>
              </span>
              <button onClick={handleLogoutClick} className="bg-primary/10 text-primary hover:bg-primary hover:text-background p-2 rounded-lg text-2xl font-semibold transition-all cursor-pointer">
                <RiLogoutCircleRLine />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Overlay / Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)} // Klik di luar untuk batal
          />

          {/* Modal Box */}
          <div className="relative bg-background border border-my-border w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-up">
            <div className="text-center space-y-4">
              {/* Icon (Opsional) */}
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-primary text-3xl">
                <RiLogoutCircleRLine />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
                <p className="text-gray-400 text-sm">Are you sure you want to end your current session?</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-my-border hover:bg-white/5 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={handleActualLogout} className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/80 transition-colors font-bold">
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
