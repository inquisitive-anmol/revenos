import { create } from 'zustand';

interface BillingState {
  balance: number;
  plan: string;
  status: string;
  nextResetAt: string | null;
  monthlyCreditsIncluded: number;
  totalInCycle: number;
  isLoading: boolean;
  error: string | null;

  setBillingData: (data: {
    balance: number;
    plan: string;
    status: string;
    nextResetAt: string;
    monthlyCreditsIncluded: number;
    totalInCycle: number;
  }) => void;
  setBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  balance: 0,
  plan: 'free',
  status: 'active',
  nextResetAt: null,
  monthlyCreditsIncluded: 0,
  totalInCycle: 0,
  isLoading: false,
  error: null,

  setBillingData: (data) => set({
    balance: data.balance,
    plan: data.plan,
    status: data.status,
    nextResetAt: data.nextResetAt,
    monthlyCreditsIncluded: data.monthlyCreditsIncluded,
    totalInCycle: data.totalInCycle,
    isLoading: false,
    error: null
  }),

  setBalance: (balance) => set({ balance }),
  
  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set({
    balance: 0,
    plan: 'free',
    status: 'active',
    nextResetAt: null,
    monthlyCreditsIncluded: 0,
    totalInCycle: 0,
    isLoading: false,
    error: null
  }),
}));
