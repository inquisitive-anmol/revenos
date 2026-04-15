import React from 'react';

interface PlanCardProps {
  currentPlan: string;
}

const PLANS = [
  {
    name: 'Starter',
    id: 'starter',
    price: 99,
    credits: 5000,
    features: ['500 AI Agents', 'SerpAPI Search', 'Core CRM'],
  },
  {
    name: 'Growth',
    id: 'growth',
    price: 249,
    credits: 15000,
    features: ['Unlimited AI Agents', 'Premium Support', 'Lead Scoring'],
    isPopular: true
  },
  {
    name: 'Scale',
    id: 'scale',
    price: 499,
    credits: 50000,
    features: ['Custom ICP Tuning', 'API Access', 'Dedicated Manager'],
  }
];

export const PlanCard: React.FC<PlanCardProps> = ({ currentPlan }) => {
  return (
    <div className="bg-surface rounded-2xl p-8 border border-outline shadow-sm flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary" data-icon="star">star</span>
        <h3 className="text-xl font-extrabold tracking-tight">Current Plan</h3>
      </div>

      <div className="space-y-4 flex-1">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan.toLowerCase();
          return (
            <div 
              key={plan.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                isCurrent 
                  ? 'border-primary bg-primary/5' 
                  : 'border-outline/30 bg-surface-container-low/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black">{plan.name}</span>
                {isCurrent && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary-container px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black">${plan.price}</span>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter">/ month</span>
              </div>
              <p className="text-[11px] text-secondary mt-2 font-medium">{plan.credits.toLocaleString()} credits included</p>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
        Upgrade Subscription
        <span className="material-symbols-outlined text-sm">north_east</span>
      </button>
    </div>
  );
};
