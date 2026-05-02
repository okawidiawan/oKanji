import { createBrowserRouter } from "react-router-dom";

// Placeholder layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Placeholder pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import KanjiListPage from "../pages/kanji/KanjiListPage";
import KanjiDetailPage from "../pages/kanji/KanjiDetailPage";
import ProfilePage from "../pages/user/ProfilePage";
import LandingPage from "../pages/LandingPage";

const router = createBrowserRouter([
  //  Contoh struktur routing:
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    element: <MainLayout />,
    children: [
      { path: "kanji", element: <KanjiListPage /> },
      { path: "kanji/:id", element: <KanjiDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
]);

export default router;
