import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useApi } from '../../lib/api';

interface CreditPackage {
  _id: string;
  name: string;
  credits: number;
  priceUsd: number;
  isPopular: boolean;
}

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: CreditPackage[];
  onSuccess: () => void;
}

declare const Razorpay: any;

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, packages, onSuccess }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const api = useApi();

  if (!isOpen) return null;

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      setLoading(pkg._id);
      
      // 1. Create Order on backend using authenticated api utility
      const { data: response } = await api.post('/api/v1/billing/topup', {
        packageId: pkg._id
      });
      const orderData = response.data;

      // 2. Initialise Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RevenOs',
        description: `Purchase ${pkg.name} (${pkg.credits} credits)`,
        order_id: orderData.orderId,
        handler: function () {
          toast.success('Payment successful! Credits will be added shortly.');
              onSuccess();
              onClose();
        },
        prefill: {
          name: 'RevUser',
          email: 'user@revenos.ai'
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate purchase');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-outline flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-outline flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Boost Your Credits</h2>
            <p className="text-sm text-secondary font-medium">Select a package to keep your engine running at full speed.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-xl transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg._id} 
              className={`relative bg-surface p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                pkg.isPopular ? 'border-primary shadow-lg shadow-primary/10' : 'border-outline/50'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">{pkg.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{pkg.credits.toLocaleString()}</span>
                  <span className="text-xs text-secondary font-bold">Credits</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold font-serif">$</span>
                  <span className="text-2xl font-black tracking-tighter">{pkg.priceUsd}</span>
                </div>
                <button 
                  disabled={!!loading}
                  onClick={() => handlePurchase(pkg)}
                  className={`w-full py-3 rounded-xl text-sm font-black transition-all active:scale-[0.98] ${
                    pkg.isPopular 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant' 
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  {loading === pkg._id ? 'Initialising...' : 'Select Pack'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-surface-container-low/50 border-t border-outline flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">shield_check</span>
            Secure Transaction
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            Instant Delivery
          </div>
        </div>
      </div>
    </div>
  );
};
