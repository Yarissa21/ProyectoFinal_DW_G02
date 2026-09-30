import { create } from 'zustand';
import type { AuthTokens, AuthUser } from '../types/auth';

const REFRESH_KEY = 'rh.refreshToken';

export const tokenStorage = {
  get(): string | null {
    try {
      return sessionStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  set(value: string): void {
    try {
      sessionStorage.setItem(REFRESH_KEY, value);
    } catch {
      return;
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(REFRESH_KEY);
    } catch {
      return;
    }
  },
};

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  clearSession: () => void;
  finishInitializing: () => void;
}

const storedRefresh = tokenStorage.get();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: storedRefresh,
  isAuthenticated: false,
  isInitializing: storedRefresh !== null,
  setSession: (user, tokens) => {
    tokenStorage.set(tokens.refreshToken);
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },
  clearSession: () => {
    tokenStorage.clear();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
  finishInitializing: () => set({ isInitializing: false }),
}));