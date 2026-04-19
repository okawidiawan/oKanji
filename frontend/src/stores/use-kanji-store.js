import { create } from 'zustand';

const useKanjiStore = create((set) => ({
  kanjis: [],
  currentKanji: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    size: 10,
    total: 0,
  },

  // Actions
  setKanjis: (kanjis) => set({ kanjis }),
  setCurrentKanji: (kanji) => set({ currentKanji: kanji }),
  setLoading: (loading) => set({ loading }),
  
  // TODO: Tambahkan fetch logic di layer service/hooks
}));

export default useKanjiStore;
