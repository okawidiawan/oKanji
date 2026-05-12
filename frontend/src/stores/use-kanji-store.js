import { create } from 'zustand';
import kanjiService from '../services/kanji-service';

const useKanjiStore = create((set, get) => ({
  // State
  kanjis: [],
  currentKanji: null,
  isLoading: false,
  error: null,
  paging: {
    page: 1,
    total_item: 0,
    total_page: 0,
  },
  filters: {
    level: '',
    search: '',
  },

  // Actions
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      paging: { ...state.paging, page: 1 }, // Reset to page 1 on filter change
    }));
  },

  fetchKanjis: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = {
        page,
        size: 20, // Default size
        ...filters,
      };
      
      const result = await kanjiService.getKanjis(params);
      // Backend returns { data, paging: { page, total_item, total_page } }
      set({
        kanjis: result.data,
        paging: result.paging,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Gagal mengambil daftar kanji.";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchKanjiDetail: async (kanjiId) => {
    set({ isLoading: true, error: null, currentKanji: null });
    try {
      const result = await kanjiService.getKanjiById(kanjiId);
      // Backend returns { data: { ...kanji, kotoba: [...] } }
      set({ currentKanji: result.data });
    } catch (error) {
      const message = error.response?.data?.error || "Gagal mengambil detail kanji.";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useKanjiStore;
