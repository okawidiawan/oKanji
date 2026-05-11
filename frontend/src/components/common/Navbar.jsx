import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/use-auth-store";
import logoImg from "../../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {}
  };

  return (
    <nav className="border-b sticky z-50 border-my-border bg-transparent backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/kanji" className="text-2xl font-bold text-primary tracking-tighter">
          <img src={logoImg} alt="okanji Logo" className="h-10 w-auto" />
        </Link>

        {/* Menu Navigasi */}
        <div className="flex items-center gap-6">
          <Link to="/kanji" className="hover:text-primary transition-colors">
            Kanji List
          </Link>
          <Link to="/profile" className="hover:text-primary transition-colors">
            Profile
          </Link>

          {/* Info User & Tombol Logout */}
          <div className="flex items-center gap-4 ml-4 border-l border-my-border pl-6">
            <span className="text-sm text-gray-400 hidden sm:inline">
              Halo, <span className="text-white font-medium">{user?.username}</span>
            </span>
            <button onClick={handleLogout} className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
