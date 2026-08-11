import React, { useState } from 'react';
import { CreditCard, Landmark, Smartphone, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaystackCardCheckout({ amount, partnerName, onSubmit, submitting }) {
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  };

  const handleSubmit = () => {
    const digits = cardNumber.replace(/\s/g, '');
    if (method === 'card') {
      if (digits.length < 16) {
        toast.error('Please enter a valid card number.');
        return;
      }
      if (!/^\d{2}\s\/\s\d{2}$/.test(expiry)) {
        toast.error('Please enter a valid expiry date (MM / YY).');
        return;
      }
      if (cvv.length < 3) {
        toast.error('Please enter a valid CVV.');
        return;
      }
    }
    // Last 4 digits only — never store full card details
    const last4 = digits.slice(-4);
    onSubmit({ method, last4 });
  };

  const METHODS = [
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'transfer', label: 'Transfer', icon: Landmark },
    { id: 'ussd', label: 'USSD', icon: Smartphone }
  ];

  return (
    <div className="bg-[#f7f7f7] rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Sidebar */}
        <div className="sm:w-44 bg-[#fafafa] border-r border-[#ececec] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8c9196] mb-3">Pay With</p>
          <div className="space-y-1">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#65b487]/10 text-[#65b487]'
                      : 'text-[#8c9196] hover:bg-[#f0f0f0]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-5 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-[#8c9196] mb-0.5 truncate max-w-[180px]">
                {partnerName || 'Payment'}
              </p>
              <p className="text-lg font-bold text-[#65b487]">
                Pay ₦{Number(amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8c9196] uppercase tracking-wide">Transaction</p>
              <p className="text-[11px] text-[#333e48] font-mono">
                {Date.now().toString().slice(-8)}
              </p>
            </div>
          </div>

          {method === 'card' ? (
            <>
              <h3 className="text-sm font-semibold text-[#333e48] text-center mb-4">
                Enter your card details to pay
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#4d81b7] block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full rounded border border-[#4d81b7] px-3 py-2.5 text-sm text-[#333e48] placeholder:text-[#c0c4c8] focus:outline-none focus:ring-1 focus:ring-[#4d81b7]"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8c9196] block mb-1">
                      Card Expiry
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className="w-full rounded border border-[#d0d4d8] px-3 py-2.5 text-sm text-[#333e48] placeholder:text-[#c0c4c8] focus:outline-none focus:ring-1 focus:ring-[#4d81b7]"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8c9196]">
                        CVV
                      </label>
                      <span className="text-[10px] text-[#4d81b7] font-medium">HELP?</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full rounded border border-[#d0d4d8] px-3 py-2.5 text-sm text-[#333e48] placeholder:text-[#c0c4c8] focus:outline-none focus:ring-1 focus:ring-[#4d81b7]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#65b487] hover:bg-[#58a379] text-white font-semibold text-sm rounded-md py-3 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Processing...' : `Pay ₦${Number(amount || 0).toLocaleString()}`}
                </button>
              </div>
            </>
          ) : method === 'transfer' ? (
            <div className="text-center py-6">
              <Landmark className="w-8 h-8 text-[#65b487] mx-auto mb-3" />
              <p className="text-sm text-[#333e48] font-medium mb-1">Bank Transfer</p>
              <p className="text-xs text-[#8c9196] mb-4">Select this option to pay via direct bank transfer.</p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#65b487] hover:bg-[#58a379] text-white font-semibold text-sm rounded-md py-3 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Processing...' : 'Continue'}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Smartphone className="w-8 h-8 text-[#65b487] mx-auto mb-3" />
              <p className="text-sm text-[#333e48] font-medium mb-1">USSD</p>
              <p className="text-xs text-[#8c9196] mb-4">Pay using a USSD code from your bank app.</p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#65b487] hover:bg-[#58a379] text-white font-semibold text-sm rounded-md py-3 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Processing...' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white px-5 pb-4 pt-1">
        <p className="text-[11px] text-[#8c9196] flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Secured by <span className="font-bold text-[#333e48]">paystack</span>
        </p>
      </div>
    </div>
  );
}