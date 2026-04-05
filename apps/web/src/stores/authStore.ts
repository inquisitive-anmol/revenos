import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean; // Sync with Clerk's loaded state
  error: string | null;
  pendingVerification: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  setAuth: (payload: { isAuthenticated: boolean; user: AuthState['user'] }) => void;
  setLoading: (loaded: boolean) => void;
  setError: (error: string | null) => void;
  setPendingVerification: (status: boolean) => void;
  clearAuth: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingVerification: false,
  user: null,

  setAuth: (payload) =>
    set({
      isAuthenticated: payload.isAuthenticated,
      user: payload.user,
    }),

  setLoading: (loaded) =>
    set({
      isLoading: loaded,
    }),

  setError: (error: string | null) =>
    set({
      error,
    }),

  setPendingVerification: (status) => set({ pendingVerification: status }),

  clearAuth: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),

  reset: () => set({ isLoading: false, error: null }),
}));

export const useUserStore = create((set) => ({
  dbUser: null,
  setDbUser: (data: any) => set({ dbUser: data }),
}));