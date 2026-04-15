import React from 'react';

interface CreditBalanceProps {
  balance: number;
  plan: string;
  nextResetAt: string;
  allocation: number;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({ balance, plan, nextResetAt, allocation }) => {
  const resetDate = new Date(nextResetAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const percent = Math.round((balance / allocation) * 100);

  return (
    <div className="bg-surface rounded-2xl p-8 border border-outline shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em]">Available Credits</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
            balance < allocation * 0.2 ? 'bg-error-container text-error' : 'bg-primary-container text-primary'
          }`}>
            {plan} Plan
          </span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h2 className="text-6xl font-black tracking-tighter text-on-surface">
            {(balance || 0).toLocaleString()}
          </h2>
          <span className="text-secondary font-bold text-lg">/ {(allocation || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-secondary font-medium">Monthly Allocation</span>
          <span className="text-on-surface font-bold">{percent}% Remaining</span>
        </div>
        <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden border border-outline/30">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              percent < 20 ? 'bg-error' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-secondary mt-4 flex items-center gap-1.5 font-medium">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Next credit refresh on <span className="text-on-surface font-bold">{resetDate}</span>
        </p>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
