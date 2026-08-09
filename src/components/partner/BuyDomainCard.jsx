import React, { useRef, useState } from 'react';
import { Loader2, Copy, Check, Globe, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import PaymentSupportNote from './PaymentSupportNote';
import { toast } from 'sonner';

const DOMAIN_PRICE = 10000;
const ACCOUNT_NAME = 'RONKE FABUNMI';
const ACCOUNT_NUMBER = '7031665045';
const BANK_NAME = 'Opay';

export default function BuyDomainCard({ partner, user }) {
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setScreenshot({ file, previewUrl, uploadedUrl: null });
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setScreenshot({ previewUrl, uploadedUrl: file_url });
    } catch (_) {
      toast.error('Failed to upload screenshot');
      setScreenshot(null);
    } finally {
      setUploading(false);
    }
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

  if (submitted) {
    return (
      <div className="text-center py-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold">Payment Submitted!</p>
        <p className="text-xs text-muted-foreground mt-1">Your domain request will be reviewed shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Buy Domain</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">Amount</span>
          <span className="font-bold text-sm">₦{DOMAIN_PRICE.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">Bank</span>
          <span className="text-xs font-medium">{BANK_NAME}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">Name</span>
          <button onClick={() => copy(ACCOUNT_NAME, 'name')} className="flex items-center gap-1">
            <span className="text-xs font-semibold">{ACCOUNT_NAME}</span>
            {copied === 'name' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">Account</span>
          <button onClick={() => copy(ACCOUNT_NUMBER, 'acct')} className="flex items-center gap-1">
            <span className="text-xs font-semibold font-mono">{ACCOUNT_NUMBER}</span>
            {copied === 'acct' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </button>
        </div>
      </div>

      <PaymentSupportNote />

      <Input placeholder="Ref (optional)" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} className="h-8 text-xs" />

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
      {screenshot?.previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={screenshot.previewUrl} alt="Payment screenshot" className="w-full max-h-24 object-cover" />
          {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>}
          {!uploading && <button onClick={() => { setScreenshot(null); fileInputRef.current.value = ''; }} className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Remove</button>}
        </div>
      ) : (
        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border border-dashed border-border rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-[11px]">Upload screenshot</span>
        </button>
      )}

      <Button className="w-full h-8 rounded-full text-xs" onClick={handleSubmit} disabled={submitting || uploading || !screenshot?.uploadedUrl}>
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
        {submitting ? 'Submitting...' : "I've Made the Payment"}
      </Button>
    </div>
  );
}