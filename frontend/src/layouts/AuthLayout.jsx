import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/use-auth-store";
import logo from "../assets/Logo.png";

export default function AuthLayout() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Jika sudah login, diredirect ke dashboard/kanji list
    if (isAuthenticated) {
      navigate("/kanji", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-white p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 border border-my-border bg-transparent backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
          <div className="mb-8 flex flex-col items-center">
            <img src={`${logo}`} alt="okanji logo" className="w-auto h-12" />
            <p className="text-gray-400 mt-2">Your Personal Kanji Companion.</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
