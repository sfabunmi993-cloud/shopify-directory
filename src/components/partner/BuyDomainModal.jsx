import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const DOMAIN_PRICE = 10000; // NGN
const ACCOUNT_NAME = 'Fabunmi Ronke';
const ACCOUNT_NUMBER = '9068191624';
const BANK_NAME = 'PalmPay';

export default function BuyDomainModal({ partner, isOpen, onClose, user }) {
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState('');

  const handleClose = () => {
    setTransactionRef('');
    setSubmitted(false);
    onClose();
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Payment.create({
      user_id: user?.id,
      user_name: user?.full_name,
      user_email: user?.email,
      partner_id: partner?.id,
      partner_name: partner?.name,
      amount: DOMAIN_PRICE,
      description: `Domain Purchase - ${partner?.name}`,
      status: 'pending',
      admin_note: transactionRef ? `Ref: ${transactionRef}` : undefined,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Buy Domain
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Payment Submitted!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your domain purchase request has been received. An admin will review and activate your domain shortly.
            </p>
            <Button className="rounded-full w-full" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
              <p className="font-semibold text-primary mb-1">Domain Package</p>
              <p className="text-muted-foreground">Get a custom domain for your partner profile. Your profile will be accessible via your own branded URL.</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Payment Details</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">₦{DOMAIN_PRICE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">{ACCOUNT_NAME}</span>
                    <button onClick={() => copy(ACCOUNT_NAME, 'name')} className="p-1 rounded hover:bg-muted">
                      {copied === 'name' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm font-mono">{ACCOUNT_NUMBER}</span>
                    <button onClick={() => copy(ACCOUNT_NUMBER, 'acct')} className="p-1 rounded hover:bg-muted">
                      {copied === 'acct' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank</span>
                  <span className="font-medium text-sm">{BANK_NAME}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Transaction Reference (optional)</label>
              <Input
                placeholder="e.g. TRF123456789"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>

            <Button
              className="w-full rounded-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {submitting ? 'Submitting...' : 'I\'ve Made the Payment →'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}