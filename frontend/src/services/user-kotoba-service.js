import api from '../lib/api';

/**
 * User Kotoba Service
 * Menangani progres belajar kosakata (kotoba) tiap pengguna.
 */
const userKotobaService = {
  /**
   * Menambahkan kotoba ke dalam daftar hafalan user
   * @param {string} kotobaId - UUID Kotoba
   * @returns {Promise<Object>}
   */
  add: async (kotobaId) => {
    const response = await api.post(`/user-kotoba/${kotobaId}`);
    return response.data;
  },

  /**
   * Memperbarui detail progres hafalan kotoba user
   * @param {string} kotobaId - UUID Kotoba
   * @param {Object} data - { isMemorized, difficulty, note }
   * @returns {Promise<Object>}
   */
  update: async (kotobaId, data) => {
    const response = await api.patch(`/user-kotoba/${kotobaId}`, data);
    return response.data;
  },

  /**
   * Menghapus kotoba dari daftar hafalan user
   * @param {string} kotobaId - UUID Kotoba
   * @returns {Promise<Object>}
   */
  remove: async (kotobaId) => {
    const response = await api.delete(`/user-kotoba/${kotobaId}`);
    return response.data;
  },
};

export default userKotobaService;
