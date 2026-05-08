import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/use-auth-store";

/**
 * Protected Route Component
 * Menjaga rute agar hanya bisa diakses oleh user yang sudah terautentikasi.
 * Jika belum login, akan diredirect ke halaman login.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Jika tidak terautentikasi, lempar ke halaman login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Jika terautentikasi, render anak rute (MainLayout dsb)
  return <Outlet />;
}
