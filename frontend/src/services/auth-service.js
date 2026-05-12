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

  /**
   * Memperbarui data profil user yang sedang login
   * @param {Object} data - Objek parsial { name, email, password }
   * @returns {Promise<Object>}
   */
  updateProfile: async (data) => {
    const response = await api.patch('/users/current', data);
    return response.data;
  },
};

export default authService;
