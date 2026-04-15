import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface UsageStat {
  reason: string;
  totalAmount: number;
  count: number;
}

interface UsageBreakdownProps {
  stats: UsageStat[];
}

const REASON_LABELS: Record<string, string> = {
  'LEAD_SOURCED': 'Sourcing',
  'LEAD_ENRICHED_HUNTER': 'Hunter',
  'LEAD_ENRICHED_SERP': 'SerpAPI',
  'EMAIL_SENT': 'Emails',
  'AI_AGENT_RUN': 'AI Agents',
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export const UsageBreakdown: React.FC<UsageBreakdownProps> = ({ stats }) => {
  const data = stats.map(s => ({
    name: REASON_LABELS[s.reason] || s.reason,
    credits: s.totalAmount,
    label: s.reason
  })).sort((a, b) => b.credits - a.credits);

  return (
    <div className="bg-surface rounded-2xl p-8 border border-outline shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight">Credit Consumption</h3>
          <p className="text-sm text-secondary font-medium">Monthly usage breakdown by action type</p>
        </div>
        <span className="material-symbols-outlined text-secondary opacity-20 text-4xl">analytics</span>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              />
              <Bar dataKey="credits" radius={[6, 6, 0, 0]} barSize={40}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/30 rounded-2xl border border-dashed border-outline">
             <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shadow-sm mb-4">
               <span className="material-symbols-outlined text-3xl text-primary/30">monitoring</span>
             </div>
             <p className="text-sm font-black text-on-surface mb-1">No Activity Detected</p>
             <p className="text-[11px] text-secondary font-medium max-w-[200px]">
               Launch a campaign or enrich leads to see your credit utilization here.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
