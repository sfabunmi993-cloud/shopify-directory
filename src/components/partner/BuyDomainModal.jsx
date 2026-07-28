import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check, Upload, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const DOMAIN_PRICE = 10000; // NGN
const ACCOUNT_NAME = 'Fabunmi Ronke';
const ACCOUNT_NUMBER = '9068191624';
const BANK_NAME = 'PalmPay';

export default function BuyDomainModal({ partner, isOpen, onClose, user }) {
  const [step, setStep] = useState(1);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState('');

  const handleClose = () => {
    setStep(1);
    setTransactionRef('');
    setReceiptFile(null);
    setReceiptPreview(null);
    setSubmitted(false);
    onClose();
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!receiptFile) { toast.error('Please upload your payment receipt'); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: receiptFile });
    setUploading(false);
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
      admin_note: `Receipt: ${file_url}${transactionRef ? ` | Ref: ${transactionRef}` : ''}`,
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
        ) : step === 1 ? (
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

            <Button className="w-full rounded-full" onClick={() => setStep(2)}>
              I've Made the Payment →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Upload your payment receipt and optionally add your transaction reference.</p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Payment Receipt *</label>
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {receiptPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={receiptPreview} alt="Receipt" className="w-full max-h-48 object-contain bg-muted" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors">
                    <Upload className="w-6 h-6 opacity-50" />
                    <p className="text-sm">Click to upload receipt</p>
                  </div>
                )}
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Transaction Reference (optional)</label>
              <Input
                placeholder="e.g. TRF123456789"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="flex-1 rounded-full"
                onClick={handleSubmit}
                disabled={!receiptFile || uploading || submitting}
              >
                {uploading || submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}