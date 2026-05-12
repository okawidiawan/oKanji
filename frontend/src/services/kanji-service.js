import api from '../lib/api';

/**
 * Kanji Service
 * Menangani komunikasi API untuk data referensi Kanji.
 */
const kanjiService = {
  /**
   * Mengambil daftar kanji dengan filter dan paginasi
   * @param {Object} params - { page, size, level, search }
   * @returns {Promise<Object>} Mengembalikan { data, paging }
   */
  getKanjis: async (params) => {
    const response = await api.get('/kanjis', { params });
    return response.data; // Backend /kanjis langsung mengembalikan object root berisi data & paging
  },

  /**
   * Mengambil detail satu kanji beserta kotoba terkait
   * @param {string} kanjiId - UUID Kanji
   * @returns {Promise<Object>} Mengembalikan { data: { ...kanji, kotoba: [...] } }
   */
  getKanjiById: async (kanjiId) => {
    const response = await api.get(`/kanjis/${kanjiId}`);
    return response.data;
  },
};

export default kanjiService;
