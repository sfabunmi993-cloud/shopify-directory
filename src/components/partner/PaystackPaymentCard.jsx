import React, { useState } from 'react';
import { Copy, Check, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function PaystackPaymentCard({ amount, accountName, accountNumber, bankName }) {
  const [copied, setCopied] = useState('');

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  const Row = ({ label, value, copyKey, highlight }) => (
    <div
      className={`flex items-center justify-between gap-2 px-4 py-3.5 border-b border-gray-100 last:border-b-0 ${
        highlight ? 'bg-[#011A2C]' : 'bg-white'
      }`}
    >
      <div>
        <p className={`text-[10px] uppercase tracking-wider font-medium ${highlight ? 'text-white/50' : 'text-gray-400'}`}>
          {label}
        </p>
        <p
          className={`font-semibold mt-0.5 ${highlight ? 'text-white text-xl font-mono tracking-wider' : 'text-gray-900 text-[15px]'}`}
        >
          {value}
        </p>
      </div>
      <button
        onClick={() => copy(value, copyKey)}
        className={`p-2 rounded-lg transition-colors ${highlight ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
        type="button"
      >
        {copied === copyKey ? (
          <Check className={`w-4 h-4 text-green-500`} />
        ) : (
          <Copy className={`w-4 h-4 ${highlight ? 'text-white/70' : 'text-gray-400'}`} />
        )}
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Header */}
      <div className="bg-[#011A2C] px-4 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-semibold leading-tight">Pay with Transfer</p>
          <p className="text-white/40 text-[11px] mt-0.5">Paystack-Titan</p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Amount</p>
          <p className="text-white font-bold text-lg leading-tight">₦{amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Body */}
      <div>
        <Row label="Bank" value={bankName} copyKey="bank" />
        <Row label="Account Name" value={accountName} copyKey="name" />
        <Row label="Account Number" value={accountNumber} copyKey="acct" highlight />
      </div>

      {/* Footer */}
      <div className="bg-[#FAFAFA] px-4 py-2.5 flex items-center justify-center gap-1.5 border-t border-gray-100">
        <ShieldCheck className="w-3 h-3 text-gray-400" />
        <span className="text-[11px] text-gray-400 font-medium">Secured by Paystack</span>
      </div>
    </div>
  );
}