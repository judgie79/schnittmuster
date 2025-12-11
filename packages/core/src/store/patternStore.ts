import { create } from 'zustand';

export interface PatternFilters {
  query: string;
  zielgruppe: string[];
  kleidungsart: string[];
  hersteller: string[];
  lizenz: string[];
  groesse: string[];
  status: string[];
  favoriteOnly: boolean;
}

export interface PatternState {
  filters: PatternFilters;
  setFilters: (filters: Partial<PatternFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: PatternFilters = {
  query: '',
  zielgruppe: [],
  kleidungsart: [],
  hersteller: [],
  lizenz: [],
  groesse: [],
  status: [],
  favoriteOnly: false,
};

export const usePatternStore = create<PatternState>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
