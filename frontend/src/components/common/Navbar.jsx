import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/use-auth-store";
import logoImg from "../../assets/logo.svg";
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
      <nav className="hidden sm:block border-b fixed sm:sticky z-50 border-my-border  bg-transparent backdrop-blur-md bottom-0 top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)] w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center sm:justify-between">
          {/* Logo / Brand */}
          <Link to="/kanji" className="hidden sm:block">
            <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
          </Link>

          {/* Menu Navigasi */}
          <div className="flex items-center gap-6">
            <div className="profile ">
              <NavLink to="/profile" className={({ isActive }) => `hidden sm:block transition-colors ${isActive ? "text-primary text-lg font-semibold" : "text-gray-400 hover:text-primary"}`}>
                Profile
              </NavLink>
            </div>

            <div className="kanji-list ">
              <NavLink to="/kanji" className={({ isActive }) => `hidden sm:block transition-colors ${isActive ? "text-primary text-lg font-semibold" : "text-gray-400 hover:text-primary"}`}>
                Kanji List
              </NavLink>
            </div>

            <div className="my-kanji ">
              <NavLink to="/my-kanji" className={({ isActive }) => `hidden sm:block transition-colors ${isActive ? "text-primary text-lg font-semibold" : "text-gray-400 hover:text-primary"}`}>
                My Kanji
              </NavLink>
            </div>

            {/* Info User & Tombol Logout */}
            <div className="flex items-center gap-4 ml-4 border-l border-my-border pl-6 pr-6">
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

      <nav className="sm:hidden fixed bottom-2 z-50 w-full justify-center items-center">
        <div className=" gap-4 mx-auto px-4 h-16 flex items-center justify-center sm:justify-between w-full">
          <div className="logout-button">
            <button onClick={handleLogoutClick} className="bg-transparent border border-my-border backdrop-blur-md  p-4 text-2xl font-semibold rounded-full text-primary/80 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
              <RiLogoutCircleRLine />
            </button>
          </div>

          {/* Menu Navigasi Mobile */}
          <div className="flex items-center ">
            <div className="flex backdrop-blur-md border border-my-border gap-8 py-2 px-8 rounded-full bg-transparent shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
              {/* Profile Mobile */}
              <div className="profile">
                <NavLink to="/profile" className={({ isActive }) => `sm:hidden transition-colors ${isActive ? "text-primary" : "text-secondary-dark hover:text-primary"}`}>
                  <div className="flex flex-col justify-center items-center gap-2">
                    <FaUser className="text-lg" />
                    <p className="text-xs">Profile</p>
                  </div>
                </NavLink>
              </div>
              {/* Kanji List Mobile */}
              <div className="kanji-list">
                <NavLink to="/kanji" className={({ isActive }) => `sm:hidden transition-colors ${isActive ? "text-primary" : "text-secondary-dark hover:text-primary"}`}>
                  <div className="flex flex-col justify-center items-center gap-2">
                    <FaBookOpen className="text-lg" />
                    <p className="text-xs">Kanji List</p>
                  </div>
                </NavLink>
              </div>
              {/* My Kanji Mobile */}
              <div className="my-kanji">
                <NavLink to="/my-kanji" className={({ isActive }) => `sm:hidden transition-colors ${isActive ? "text-primary" : "text-secondary-dark hover:text-primary"}`}>
                  <div className="flex flex-col justify-center items-center gap-2">
                    <FaBookmark className="text-lg" />
                    <p className="text-xs">My Kanji</p>
                  </div>
                </NavLink>
              </div>
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
