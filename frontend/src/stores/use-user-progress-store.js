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
  loadingCount: 0,
  get isLoading() {
    return get().loadingCount > 0;
  },
  error: null,

  // Actions
  fetchUserKanjis: async (params = {}) => {
    set((state) => ({ loadingCount: state.loadingCount + 1, error: null }));
    try {
      const result = await userKanjiService.getList(params);
      set({
        userKanjis: result.data,
        paging: result.paging,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Failed to fetch learning progress list.";
      set({ error: message });
    } finally {
      set((state) => ({ loadingCount: state.loadingCount - 1 }));
    }
  },

  fetchProgressDetail: async (kanjiId) => {
    set((state) => ({ loadingCount: state.loadingCount + 1, error: null }));
    try {
      const result = await userKanjiService.getDetail(kanjiId);
      // result.data contains progress + kanji + kotoba (with user progress)
      set({ currentProgressDetail: result.data });
    } catch (error) {
      // 404 is expected if user hasn't started learning the kanji
      if (error.response?.status === 404) {
        set({ currentProgressDetail: null });
      } else {
        const message = error.response?.data?.error || "Failed to fetch progress detail.";
        set({ error: message });
      }
    } finally {
      set((state) => ({ loadingCount: state.loadingCount - 1 }));
    }
  },

  memorizeKanji: async (kanjiId, data) => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
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
      const message = error.response?.data?.error || "Failed to update memorization status.";
      set({ error: message });
      throw error;
    } finally {
      set((state) => ({ loadingCount: state.loadingCount - 1 }));
    }
  },

  quickAddKanji: async (kanjiId) => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
    try {
      const result = await userKanjiService.add(kanjiId);
      // Ambil data detail langsung dari service, tanpa memanggil action store lain
      const detailResult = await userKanjiService.getDetail(kanjiId);
      set({ currentProgressDetail: detailResult.data });
      return result.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to add to learning list.";
      set({ error: message });
      throw error;
    } finally {
      set((state) => ({ loadingCount: state.loadingCount - 1 }));
    }
  },

  /**
   * Menghapus seluruh progress belajar kanji (Batal Pelajari)
   * @param {string} kanjiId - UUID Kanji
   */
  removeKanjiProgress: async (kanjiId) => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
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
      const message = error.response?.data?.error || "Failed to remove kanji progress.";
      set({ error: message });
      throw error;
    } finally {
      set((state) => ({ loadingCount: state.loadingCount - 1 }));
    }
  },

  /**
   * Menambahkan kosakata ke daftar hafalan user
   * @param {string} kotobaId - UUID Kotoba
   */
  addKotobaProgress: async (kotobaId) => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
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
      const message = error.response?.data?.error || "Failed to add vocabulary to memorization list.";
      set({ error: message });
      throw error;
    } finally {
      set((state) => ({ loadingCount: state.loadingCount - 1 }));
    }
  },

  /**
   * Menghapus kosakata dari daftar hafalan user
   * @param {string} kotobaId - UUID Kotoba
   */
  removeKotobaProgress: async (kotobaId) => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
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
      const message = error.response?.data?.error || "Failed to remove vocabulary from memorization list.";
      set({ error: message });
      throw error;
    } finally {
      set((state) => ({ loadingCount: state.loadingCount - 1 }));
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
      const message = error.response?.data?.error || "Failed to update vocabulary status.";
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUserProgressStore;
