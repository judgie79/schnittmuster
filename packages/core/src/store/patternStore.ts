import { create } from 'zustand';

export interface PatternFilters {
  query: string;
  status: string[];
  favoriteOnly: boolean;
  tagFilters: Record<string, string[]>;
}

export interface PatternState {
  filters: PatternFilters;
  setFilters: (filters: Partial<PatternFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: PatternFilters = {
  query: '',
  status: [],
  favoriteOnly: false,
  tagFilters: {},
};

export const usePatternStore = create<PatternState>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
