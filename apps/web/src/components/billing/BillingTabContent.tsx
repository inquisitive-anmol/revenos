import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditBalance } from './CreditBalance';
import { UsageBreakdown } from './UsageBreakdown';
import { TransactionHistory } from './TransactionHistory';
import { PlanCard } from './PlanCard';
import { TopUpModal } from './TopUpModal';
import { useBillingStore } from '../../stores/billing.store';
import { useApi } from '../../lib/api';

export const BillingTabContent: React.FC = () => {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const { setBillingData, setError } = useBillingStore();
  const api = useApi();

  // 1. Fetch Balance & Plan
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance, isError: balanceError } = useQuery({
    queryKey: ['billing-balance'],
    queryFn: async () => {
      const response = await api.get('/api/v1/billing/balance');
      return response.data.data;
    }
  });

  // Sync with global store when data arrives
  useEffect(() => {
    if (balanceData) {
      setBillingData({
        balance: balanceData.balance,
        plan: balanceData.plan,
        status: balanceData.status,
        nextResetAt: balanceData.nextResetAt,
        monthlyCreditsIncluded: balanceData.monthlyCreditsIncluded,
        totalInCycle: balanceData.totalInCycle,
      });
    }
  }, [balanceData, setBillingData]);

  // Handle Query Errors
  useEffect(() => {
    if (balanceError) {
      setError('Failed to fetch billing information. Please try again later.');
    }
  }, [balanceError, setError]);

  // 2. Fetch Transactions
  const { data: transactionData, isLoading: transLoading, refetch: refetchTrans } = useQuery({
    queryKey: ['billing-transactions'],
    queryFn: async () => {
      const response = await api.get('/api/v1/billing/transactions?limit=8');
      return response.data.data;
    }
  });

  // 3. Fetch Usage Stats
  const { data: usageStats } = useQuery({
    queryKey: ['billing-usage'],
    queryFn: async () => {
      const response = await api.get('/api/v1/billing/usage');
      return response.data.data;
    }
  });

  // 4. Fetch Packages (for Modal)
  const { data: packages = [] } = useQuery({
    queryKey: ['billing-packages'],
    queryFn: async () => {
      const response = await api.get('/api/v1/billing/packages');
      return response.data.data;
    }
  });

  const handleRefresh = () => {
    refetchBalance();
    refetchTrans();
  };

  if (balanceLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Safety fallback if data is totally missing after load
  if (!balanceData && !balanceLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-error/30">error</span>
        <h3 className="text-xl font-bold">Billing Service Unavailable</h3>
        <p className="text-secondary max-w-sm">We're having trouble reaching the billing engine. Please refresh or contact support if the problem persists.</p>
        <button onClick={() => refetchBalance()} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Try Once More</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between bg-surface-container-low p-6 rounded-2xl border border-outline border-dashed">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          </div>
          <div>
            <h3 className="font-extrabold tracking-tight">Financial Hub</h3>
            <p className="text-xs text-secondary font-medium">Control your budget and scale your outreach.</p>
          </div>
        </div>
        <button
          onClick={() => setIsTopUpOpen(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Add Credits
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Row 1: Credits & Usage */}
        <div className="col-span-12 lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreditBalance
            balance={balanceData?.balance ?? 0}
            plan={balanceData?.plan ?? 'Free'}
            nextResetAt={balanceData?.nextResetAt ?? new Date().toISOString()}
            totalInCycle={balanceData?.totalInCycle ?? 0}
          />
          <UsageBreakdown stats={usageStats || []} />
        </div>

        {/* Row 2: Transactions & Plan */}
        <div className="col-span-12 lg:col-span-8">
          <TransactionHistory
            transactions={transactionData?.transactions || []}
            isLoading={transLoading}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <PlanCard currentPlan={balanceData?.plan ?? 'Free'} />

          <div className="bg-surface-container-high/20 p-6 rounded-2xl border border-outline border-dashed flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-secondary opacity-40 mb-2">receipt_long</span>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest leading-relaxed">
              Need an invoice summary? <br />
              <button className="text-primary hover:underline mt-1">Download Statement</button>
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        packages={packages || []}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
