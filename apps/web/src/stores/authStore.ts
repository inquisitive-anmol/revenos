import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoaded: boolean; // Sync with Clerk's loaded state
  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  setAuth: (payload: { isAuthenticated: boolean; user: AuthState['user'] }) => void;
  setLoaded: (loaded: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoaded: false,
  user: null,

  setAuth: (payload) =>
    set({
      isAuthenticated: payload.isAuthenticated,
      user: payload.user,
    }),

  setLoaded: (loaded) =>
    set({
      isLoaded: loaded,
    }),

  clearAuth: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
}));
