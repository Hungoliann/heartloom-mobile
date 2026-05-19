import { create } from "zustand";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  hasOnboarded: boolean;
  signIn: (user: AppUser) => void;
  signOut: () => void;
  setHasOnboarded: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  hasOnboarded: false,
  signIn: (user) => set({ user }),
  signOut: () => set({ user: null }),
  setHasOnboarded: () => set({ hasOnboarded: true }),
}));
