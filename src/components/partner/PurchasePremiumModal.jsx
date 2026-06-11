import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Crown, Copy, Check, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ── PAYMENT ACCOUNT DETAILS ─────────────────────────────────────────────────
const PAYMENT_DETAILS = {
  bankName: 'GTBank (Guaranty Trust Bank)',
  accountName: 'Shopify Partner Base',
  accountNumber: '0123456789',       // ← replace with real account number
  amount: '$49',
  currency: 'USD / NGN equivalent',
};
// ────────────────────────────────────────────────────────────────────────────

export default function PurchasePremiumModal({ partner, isOpen, onClose, user }) {
  const [step, setStep] = useState(1); // 1 = info, 2 = confirm payment
  const [txRef, setTxRef] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setStep(1); setTxRef(''); setNotes(''); setDone(false);
    onClose();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!txRef.trim()) { toast.error('Please enter your transaction reference.'); return; }
    setLoading(true);
    await base44.entities.Payment.create({
      user_id: user?.id || '',
      user_name: user?.full_name || '',
      user_email: user?.email || '',
      partner_id: partner?.id || '',
      partner_name: partner?.name || '',
      amount: 49,
      description: `Premium Badge purchase — Tx Ref: ${txRef.trim()}${notes ? ` | Notes: ${notes}` : ''}`,
      status: 'pending',
    });
    setDone(true);
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" /> Purchase Premium Badge
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-lg">Payment submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Our team will verify your payment and activate your Premium badge within <strong>24 hours</strong>.
            </p>
            <Button className="w-full mt-2" onClick={handleClose}>Done</Button>
          </div>
        ) : step === 1 ? (
          <div className="space-y-4">
            {/* What you get */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-amber-800 flex items-center gap-1.5"><Crown className="w-4 h-4" /> Premium Badge — {PAYMENT_DETAILS.amount}</p>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>Gold ✨ Premium badge on your profile & directory listing</li>
                <li>Priority placement in search results</li>
                <li>Verified trust signal for clients</li>
                <li>One-time payment, lifetime badge</li>
              </ul>
            </div>

            {/* Payment instructions */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="font-semibold text-sm flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-primary" /> Payment Instructions</p>
              <p className="text-xs text-muted-foreground">Transfer {PAYMENT_DETAILS.amount} to the account below, then click Continue to submit your proof.</p>

              {[
                { label: 'Bank', value: PAYMENT_DETAILS.bankName },
                { label: 'Account Name', value: PAYMENT_DETAILS.accountName },
                { label: 'Account Number', value: PAYMENT_DETAILS.accountNumber },
                { label: 'Amount', value: `${PAYMENT_DETAILS.amount} (${PAYMENT_DETAILS.currency})` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2 bg-muted rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                  <button onClick={() => handleCopy(value)} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={() => setStep(2)}>
              I've made the payment — Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter your bank transaction reference / receipt number so we can verify your payment quickly.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Reference *</label>
              <Input
                placeholder="e.g. TRX-20240611-001234"
                value={txRef}
                onChange={e => setTxRef(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes (optional)</label>
              <Textarea
                placeholder="Any extra info about your payment..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="h-20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading || !txRef.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Payment'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}