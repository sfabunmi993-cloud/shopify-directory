import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check, Globe, Upload, ImageIcon } from 'lucide-react';
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
  const [screenshot, setScreenshot] = useState(null); // { file, previewUrl, uploadedUrl }
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setTransactionRef('');
    setSubmitted(false);
    setScreenshot(null);
    onClose();
  };

  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setScreenshot({ file, previewUrl, uploadedUrl: null });
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setScreenshot({ file, previewUrl, uploadedUrl: file_url });
    } catch (_) {
      toast.error('Failed to upload screenshot');
      setScreenshot(null);
    } finally {
      setUploading(false);
    }
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let adminNote = '';
    if (transactionRef) adminNote += `Ref: ${transactionRef}`;
    if (screenshot?.uploadedUrl) adminNote += `${adminNote ? ' | ' : ''}Screenshot: ${screenshot.uploadedUrl}`;

    await base44.entities.Payment.create({
      user_id: user?.id,
      user_name: user?.full_name,
      user_email: user?.email,
      partner_id: partner?.id,
      partner_name: partner?.name,
      amount: DOMAIN_PRICE,
      description: `Domain Purchase - ${partner?.name}`,
      status: 'pending',
      admin_note: adminNote || undefined
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

        {submitted ?
        <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Payment Submitted!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your domain purchase request has been received. An admin will review and activate your domain shortly.
            </p>
            <Button className="rounded-full w-full" onClick={handleClose}>Done</Button>
          </div> :

        <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
              <p className="font-semibold text-primary mb-1">Domain Package</p>
              <p className="text-muted-foreground">Payment Details Amount: ₦10,000 Bank: Opay Account Number: 9038153254 Account Name: Solomon Glory Andrew

















            </p>
            </div>

            <div className="bg-white border border-border rounded-xl p-4 space-y-3 hidden">
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
              <Input placeholder="e.g. TRF123456789" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} />
            
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Payment Screenshot <span className="text-destructive">*</span></label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
              {screenshot?.previewUrl ? <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={screenshot.previewUrl} alt="Payment screenshot" className="w-full max-h-48 object-cover" />
                  {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>}
                  {!uploading && <button onClick={() => {setScreenshot(null);fileInputRef.current.value = '';}} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md hover:bg-black/70">
                Remove</button>}
                </div> : <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
              
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-sm">Click to upload screenshot</span>
                </button>}
            </div>

            <Button className="w-full rounded-full" onClick={handleSubmit}
          disabled={submitting || uploading || !screenshot?.uploadedUrl}>
            
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {submitting ? 'Submitting...' : 'I\'ve Made the Payment →'}
            </Button>
          </div>
        }
      </DialogContent>
    </Dialog>);

}