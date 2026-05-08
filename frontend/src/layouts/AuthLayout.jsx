import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/use-auth-store";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-black text-blue-500 tracking-tighter">oKanji</h2>
            <p className="text-gray-400 mt-2">Kuasai Kanji dengan Mudah</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
