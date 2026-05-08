import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  async (config) => {
    // Ambil token dari Zustand store
    // Import di dalam untuk menghindari circular dependency
    const { default: useAuthStore } = await import('../stores/use-auth-store');
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk menangani error global
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Tangani error 401 (Unauthorized)
    if (error.response?.status === 401) {
      const { default: useAuthStore } = await import('../stores/use-auth-store');
      
      // Reset state auth
      useAuthStore.getState().logout();
      
      // Redirect ke login jika bukan di halaman login/register
      const isAuthPage = window.location.pathname.startsWith('/auth');
      if (!isAuthPage) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
