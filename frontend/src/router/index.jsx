import { createBrowserRouter, redirect } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Components
import ProtectedRoute from "../components/common/ProtectedRoute";

// Stores
import useAuthStore from "../stores/use-auth-store";
import useKanjiStore from "../stores/use-kanji-store";
import useUserProgressStore from "../stores/use-user-progress-store";

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
    loader: () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        return redirect("/profile");
      }
      return null;
    },
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
        loader: () => {
          useAuthStore.getState().clearError();
          return null;
        },
      },
      {
        path: "register",
        element: <RegisterPage />,
        loader: () => {
          useAuthStore.getState().clearError();
          return null;
        },
      },
    ],
  },
  {
    // Rute yang membutuhkan login
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "kanji",
            element: <KanjiListPage />,
          },
          {
            path: "kanji/:id",
            element: <KanjiDetailPage />,
            loader: ({ params }) => {
              const { isAuthenticated } = useAuthStore.getState();
              useKanjiStore.getState().fetchKanjiDetail(params.id);
              if (isAuthenticated) {
                useUserProgressStore.getState().fetchProgressDetail(params.id);
              }
              return null;
            },
          },
          {
            path: "my-kanji",
            element: <UserKanjiListPage />,
            loader: () => {
              useUserProgressStore.getState().fetchUserKanjis({ page: 1 });
              return null;
            },
          },
          {
            path: "profile",
            element: <ProfilePage />,
            loader: () => {
              useUserProgressStore.getState().fetchStats();
              return null;
            },
          },
        ],
      },
    ],
  },
]);

export default router;
