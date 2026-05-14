import { create } from 'zustand';
import userKanjiService from '../services/user-kanji-service';
import userKotobaService from '../services/user-kotoba-service';

/**
 * Store untuk mengelola progres belajar pengguna (Kanji & Kotoba)
 */
const useUserProgressStore = create((set, get) => ({
  // State
  userKanjis: [],
  currentProgressDetail: null,
  paging: {
    page: 1,
    total_item: 0,
    total_page: 0,
  },
  isLoading: false,
  error: null,

  // Actions
  fetchUserKanjis: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userKanjiService.getList(params);
      set({
        userKanjis: result.data,
        paging: result.paging,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Gagal mengambil daftar progres belajar.";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProgressDetail: async (kanjiId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userKanjiService.getDetail(kanjiId);
      // result.data contains progress + kanji + kotoba (with user progress)
      set({ currentProgressDetail: result.data });
    } catch (error) {
      // 404 is expected if user hasn't started learning the kanji
      if (error.response?.status === 404) {
        set({ currentProgressDetail: null });
      } else {
        const message = error.response?.data?.error || "Gagal mengambil detail progres.";
        set({ error: message });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  memorizeKanji: async (kanjiId, data) => {
    set({ isLoading: true });
    try {
      // data can contain { isMemorized, reviewCount, difficulty, note }
      const result = await userKanjiService.update(kanjiId, data);
      
      // Update local state if we are viewing the detail of this kanji
      const current = get().currentProgressDetail;
      if (current && current.kanjiId === kanjiId) {
        set({
          currentProgressDetail: { ...current, ...result.data }
        });
      }
      
      // Update list if needed
      set((state) => ({
        userKanjis: state.userKanjis.map((item) => 
          item.kanjiId === kanjiId ? { ...item, ...result.data } : item
        )
      }));
    } catch (error) {
      const message = error.response?.data?.error || "Gagal memperbarui status hafalan.";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  quickAddKanji: async (kanjiId) => {
    set({ isLoading: true });
    try {
      const result = await userKanjiService.add(kanjiId);
      // Refresh detail after add
      await get().fetchProgressDetail(kanjiId);
      return result.data;
    } catch (error) {
      const message = error.response?.data?.error || "Gagal menambahkan ke daftar belajar.";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Menghapus seluruh progress belajar kanji (Batal Pelajari)
   * @param {string} kanjiId - UUID Kanji
   */
  removeKanjiProgress: async (kanjiId) => {
    set({ isLoading: true });
    try {
      await userKanjiService.remove(kanjiId);
      
      // Reset detail jika sedang ditampilkan
      const current = get().currentProgressDetail;
      if (current && current.kanjiId === kanjiId) {
        set({ currentProgressDetail: null });
      }
      
      // Update daftar kanji user
      set((state) => ({
        userKanjis: state.userKanjis.filter((item) => item.kanjiId !== kanjiId)
      }));
    } catch (error) {
      const message = error.response?.data?.error || "Gagal menghapus progress kanji.";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Menambahkan kosakata ke daftar hafalan user
   * @param {string} kotobaId - UUID Kotoba
   */
  addKotobaProgress: async (kotobaId) => {
    set({ isLoading: true });
    try {
      const result = await userKotobaService.add(kotobaId);
      
      // Update state nested di currentProgressDetail
      const current = get().currentProgressDetail;
      if (current && current.kanji && current.kanji.kotoba) {
        const updatedKotoba = current.kanji.kotoba.map((k) => {
          if (k.id === kotobaId) {
            return { ...k, userKotoba: [result.data] };
          }
          return k;
        });
        set({
          currentProgressDetail: {
            ...current,
            kanji: { ...current.kanji, kotoba: updatedKotoba }
          }
        });
      }
    } catch (error) {
      const message = error.response?.data?.error || "Gagal menambahkan kosakata ke hafalan.";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Menghapus kosakata dari daftar hafalan user
   * @param {string} kotobaId - UUID Kotoba
   */
  removeKotobaProgress: async (kotobaId) => {
    set({ isLoading: true });
    try {
      await userKotobaService.remove(kotobaId);
      
      // Update state nested di currentProgressDetail
      const current = get().currentProgressDetail;
      if (current && current.kanji && current.kanji.kotoba) {
        const updatedKotoba = current.kanji.kotoba.map((k) => {
          if (k.id === kotobaId) {
            return { ...k, userKotoba: [] };
          }
          return k;
        });
        set({
          currentProgressDetail: {
            ...current,
            kanji: { ...current.kanji, kotoba: updatedKotoba }
          }
        });
      }
    } catch (error) {
      const message = error.response?.data?.error || "Gagal menghapus kosakata dari hafalan.";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleKotobaMemorized: async (kotobaId, data) => {
    try {
      // data can contain { isMemorized, reviewCount, difficulty, note }
      const result = await userKotobaService.update(kotobaId, data);
      
      // Update nested state in currentProgressDetail
      const current = get().currentProgressDetail;
      if (current && current.kanji && current.kanji.kotoba) {
        const updatedKotoba = current.kanji.kotoba.map((k) => {
          if (k.id === kotobaId) {
            // Update userKotoba progress inside kotoba object
            const newUserKotoba = k.userKotoba && k.userKotoba.length > 0
              ? [{ ...k.userKotoba[0], ...result.data }]
              : [result.data];
            return { ...k, userKotoba: newUserKotoba };
          }
          return k;
        });

        set({
          currentProgressDetail: {
            ...current,
            kanji: { ...current.kanji, kotoba: updatedKotoba }
          }
        });
      }
    } catch (error) {
      const message = error.response?.data?.error || "Gagal memperbarui status kosakata.";
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUserProgressStore;
