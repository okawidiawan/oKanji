import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

// TODO: Layout utama aplikasi (Navbar, Sidebar, Footer)
export default function MainLayout() {
  return (
    <div className="min-h-screen mb-24 bg-background text-white relative">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
