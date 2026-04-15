import React from 'react';

interface Transaction {
  _id: string;
  type: 'debit' | 'credit';
  amount: number;
  reason: string;
  createdAt: string;
  balanceAfter: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const REASON_LABELS: Record<string, string> = {
  'LEAD_SOURCED': 'Lead Sourcing',
  'LEAD_ENRICHED_HUNTER': 'Enrichment (Hunter)',
  'LEAD_ENRICHED_SERP': 'Enrichment (Serp)',
  'EMAIL_SENT': 'Outreach Email',
  'AI_AGENT_RUN': 'AI Agent Execution',
  'MANUAL_TOPUP': 'Credit Top-up',
  'PLAN_RESET': 'Monthly Allocation',
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, isLoading }) => {
  return (
    <div className="bg-surface rounded-2xl border border-outline shadow-sm overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-outline flex items-center justify-between">
        <h3 className="font-extrabold tracking-tight">Transaction History</h3>
        <button className="text-xs font-bold text-primary hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-[10px] font-black uppercase tracking-[0.15em] text-secondary">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/30">
            {isLoading ? (
               [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 w-24 bg-surface-container-high rounded" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-32 bg-surface-container-high rounded" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-12 bg-surface-container-high rounded" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-16 bg-surface-container-high rounded" /></td>
                </tr>
               ))
            ) : transactions.length > 0 ? (
              transactions.map((t) => (
                <tr key={t._id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-6 py-5 text-sm font-medium text-secondary">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-on-surface">{REASON_LABELS[t.reason] || t.reason}</div>
                    <div className="text-[10px] text-secondary font-medium tracking-tight truncate max-w-[150px] uppercase">Ref: {t._id.slice(-8)}</div>
                  </td>
                  <td className={`px-6 py-5 text-sm font-black ${
                    t.type === 'debit' ? 'text-error' : 'text-primary'
                  }`}>
                    {t.type === 'debit' ? '-' : '+'}{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-sm font-extrabold text-on-surface">
                    {t.balanceAfter.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <span className="material-symbols-outlined text-4xl mb-2">history</span>
                    <p className="text-sm font-bold uppercase tracking-widest">No activity recorded yet</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
