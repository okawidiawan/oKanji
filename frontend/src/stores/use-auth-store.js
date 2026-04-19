import { create } from 'zustand';

// TODO: Tambahkan persist middleware jika ingin simpan di localStorage
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  
  // TODO: Implementasi login/logout logic
  login: (userData, token) => {
    // Implementasi login
    set({ user: userData, token, isAuthenticated: true });
  },
  
  logout: () => {
    // Implementasi logout
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
