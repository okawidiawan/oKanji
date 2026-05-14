import { createBrowserRouter } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Components
import ProtectedRoute from "../components/common/ProtectedRoute";

// Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import KanjiListPage from "../pages/kanji/KanjiListPage";
import KanjiDetailPage from "../pages/kanji/KanjiDetailPage";
import ProfilePage from "../pages/user/ProfilePage";
import UserKanjiListPage from "../pages/user/UserKanjiListPage";
import LandingPage from "../pages/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    // Rute yang membutuhkan login
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "kanji", element: <KanjiListPage /> },
          { path: "kanji/:id", element: <KanjiDetailPage /> },
          { path: "my-kanji", element: <UserKanjiListPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
]);

export default router;
