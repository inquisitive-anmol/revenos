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

export interface DbUser {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
  createdAt: string;
}

interface UserStoreState {
  dbUser: DbUser | null;
  setDbUser: (data: DbUser | null) => void;
  clearDbUser: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  dbUser: null,
  setDbUser: (data) => set({ dbUser: data }),
  clearDbUser: () => set({ dbUser: null }),
}));