import api from '../lib/api';

/**
 * Auth Service
 * Menangani semua komunikasi API terkait autentikasi user.
 */
const authService = {
  /**
   * Registrasi user baru
   * @param {Object} data - { username, name, email, password }
   */
  register: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} data - { username, password }
   */
  login: async (data) => {
    const response = await api.post('/users/login', data);
    return response.data;
  },

  /**
   * Mengambil data profil user yang sedang login
   */
  getCurrentUser: async () => {
    const response = await api.get('/users/current');
    return response.data;
  },

  /**
   * Logout user (menghapus token di backend)
   */
  logout: async () => {
    const response = await api.delete('/users/logout');
    return response.data;
  },
};

export default authService;
