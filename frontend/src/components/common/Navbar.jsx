import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/use-auth-store";
import logoImg from "../../assets/logo.png";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";
import { FaUser, FaBookOpen, FaBookmark } from "react-icons/fa";

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
      <nav className="sm:border-b fixed sm:sticky z-50 border-my-border bg-background-lighter border-t sm:bg-transparent backdrop-blur-md bottom-0 sm:top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)] w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center sm:justify-between">
          {/* Logo / Brand */}
          <Link to="/kanji" className="hidden sm:block">
            <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
          </Link>

          {/* Menu Navigasi */}
          <div className="flex items-center gap-6">
            <div className="profile sm:order-1 order-2">
              <Link to="/profile" className="hidden sm:block hover:text-primary transition-colors">
                Profile
              </Link>
              <Link to="/profile" className="sm:hidden hover:text-primary transition-colors">
                <div className="flex flex-col justify-center items-center gap-2">
                  <FaUser />
                  <p className="text-xs">Profile</p>
                </div>
              </Link>
            </div>

            <div className="kanji-list order-3 sm:order-2">
              <Link to="/kanji" className="hidden sm:block hover:text-primary transition-colors">
                Kanji List
              </Link>
              <Link to="/kanji" className="sm:hidden hover:text-primary transition-colors">
                <div className="flex flex-col justify-center items-center gap-2">
                  <FaBookOpen />
                  <p className="text-xs">Kanji List</p>
                </div>
              </Link>
            </div>

            <div className="my-kanji sm:order-3 order-4">
              <Link to="/my-kanji" className="hidden sm:block hover:text-primary transition-colors">
                My Kanji
              </Link>
              <Link to="/my-kanji" className="sm:hidden hover:text-primary transition-colors">
                <div className="flex flex-col justify-center items-center gap-2">
                  <FaBookmark />
                  <p className="text-xs">My Kanji</p>
                </div>
              </Link>
            </div>

            {/* Info User & Tombol Logout */}
            <div className="flex items-center gap-4 ml-4 sm:border-l border-r border-my-border sm:pl-6 pr-6 order-1 sm:order-4">
              <span className="text-sm text-gray-400 hidden sm:inline">
                Hello, <span className="text-white font-medium">{user?.username}</span>
              </span>
              <button onClick={handleLogoutClick} className="bg-primary/10 text-primary hover:bg-primary hover:text-background p-2 rounded-lg text-2xl font-semibold transition-all cursor-pointer order-1">
                <RiLogoutCircleRLine />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleActualLogout}
        title="Confirm Logout"
        message="Are you sure you want to end your current session?"
        confirmText="Yes, Sign Out"
        type="danger"
        icon={<RiLogoutCircleRLine />}
      />
    </>
  );
}
