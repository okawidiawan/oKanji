import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../services/auth-service";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.login(credentials);
          // Backend response structure: { data: { token, username, name, email } }
          const { token, ...userData } = result.data;
          set({
            user: userData,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          const message = error.response?.data?.error || "Failed to Login. Please Check Your Username and Password.";
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(userData);
          // Jangan auto-login sesuai catatan arsitektur
        } catch (error) {
          const message = error.response?.data?.error || "An error occurred. Please try again.";
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Panggil API logout (opsional handle failure jika token sudah invalid)
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Selalu reset state lokal
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        if (!get().token) return;

        try {
          const result = await authService.getCurrentUser();
          set({ user: result.data, isAuthenticated: true });
        } catch (error) {
          // Jika token tidak valid (401), interceptor akan menangani logout
          console.error("Fetch user error:", error);
        }
      },
    }),
    {
      name: "okanji-auth-storage",
      // Hanya simpan data esensial di localStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
