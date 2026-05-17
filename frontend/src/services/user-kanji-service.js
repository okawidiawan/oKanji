import api from "../lib/api";

/**
 * User Kanji Service
 * Menangani progres belajar kanji tiap pengguna.
 */
const userKanjiService = {
  /**
   * Menyimpan atau memperbarui progres belajar kanji
   * @param {string} kanjiId - UUID Kanji
   * @param {Object} data - { difficulty, note }
   * @returns {Promise<Object>}
   */
  add: async (kanjiId, data = {}) => {
    const response = await api.post(`/user-kanji/${kanjiId}`, data);
    return response.data;
  },

  /**
   * Memperbarui progres belajar kanji (isMemorized, difficulty, note)
   * @param {string} kanjiId - UUID Kanji
   * @param {Object} data - { isMemorized, difficulty, note }
   * @returns {Promise<Object>}
   */
  update: async (kanjiId, data) => {
    const response = await api.patch(`/user-kanji/${kanjiId}`, data);
    return response.data;
  },

  /**
   * Menghapus progres belajar kanji milik user
   * @param {string} kanjiId - UUID Kanji
   * @returns {Promise<Object>}
   */
  remove: async (kanjiId) => {
    const response = await api.delete(`/user-kanji/${kanjiId}`);
    return response.data;
  },

  /**
   * Mengambil daftar seluruh progres belajar kanji milik user
   * @param {Object} params - { page, size, isMemorized }
   * @returns {Promise<Object>} Mengembalikan { data, paging }
   */
  getList: async (params) => {
    const response = await api.get("/user-kanji", { params });
    return response.data;
  },

  /**
   * Mengambil detail progres belajar untuk satu kanji tertentu
   * @param {string} kanjiId - UUID Kanji
   * @returns {Promise<Object>} Mengembalikan { data: { ...progress, kanji: { ...kanji, kotoba: [...] } } }
   */
  getDetail: async (kanjiId) => {
    const response = await api.get(`/user-kanji/${kanjiId}`);
    return response.data;
  },

  /**
   * Mengambil statistik progres belajar kanji milik user berdasarkan level
   * @returns {Promise<Object>} Mengembalikan { data: [...] }
   */
  getStats: async () => {
    const response = await api.get("/user-kanji/stats");
    return response.data;
  },
};

export default userKanjiService;
