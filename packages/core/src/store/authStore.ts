import { create } from 'zustand';
import type { UserDTO } from 'schnittmuster-manager-dtos';

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: UserDTO) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check session
  error: null,
  login: (user) => set({ user, isAuthenticated: true, isLoading: false, error: null }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
