import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Crown, Copy, Check, CreditCard, Loader2, CheckCircle, Upload, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { usePricing } from '@/hooks/usePricing';

const PAYMENT_DETAILS = {
  bankName: 'PalmPay',
  accountName: 'FABUNMI RONKE',
  accountNumber: '9068191624'
};

export default function PurchasePremiumModal({ partner, isOpen, onClose, user }) {
  const { pricing } = usePricing();
  const [step, setStep] = useState(1); // 1 = info, 2 = confirm payment
  const [txRef, setTxRef] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payBtnState, setPayBtnState] = useState('idle'); // idle | pending | ready
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = event.target.result;
        const { file_url } = await base44.integrations.Core.UploadFile({ file: fileData });
        setScreenshotFile(file);
        setScreenshotUrl(file_url);
        toast.success('Screenshot uploaded!');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload screenshot');
      setUploading(false);
    }
  };

  const handlePaymentClick = () => {
    setPayBtnState('pending');
    setTimeout(() => setPayBtnState('ready'), 2000);
  };

  const handleClose = () => {
    setStep(1);setTxRef('');setNotes('');setDone(false);
    onClose();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!txRef.trim()) {toast.error('Please enter your transaction reference.');return;}
    if (!screenshotUrl) {toast.error('Please upload your payment screenshot first.');return;}
    setLoading(true);
    await base44.entities.Payment.create({
      user_id: user?.id || '',
      user_name: user?.full_name || '',
      user_email: user?.email || '',
      partner_id: partner?.id || '',
      partner_name: partner?.name || '',
      amount: pricing.premium_badge,
      description: `Premium Badge purchase — Tx Ref: ${txRef.trim()}${notes ? ` | Notes: ${notes}` : ''}`,
      status: 'pending',
      screenshot_url: screenshotUrl
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

        {done ?
        <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-lg">Payment submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Our team will verify your payment and activate your Premium badge within <strong>24 hours</strong>.
            </p>
            <Button className="w-full mt-2" onClick={handleClose}>Done</Button>
          </div> :
        step === 1 ?
        <div className="space-y-4">
            {/* What you get */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-amber-800 flex items-center gap-1.5"><Crown className="w-4 h-4" /> Premium Badge — ₦{pricing.premium_badge.toLocaleString()}</p>
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
              <p className="text-xs text-muted-foreground">Transfer ₦{pricing.premium_badge.toLocaleString()} to the account below, then click Continue to submit your proof.</p>

              {[
            { label: 'Bank', value: PAYMENT_DETAILS.bankName },
            { label: 'Account Name', value: PAYMENT_DETAILS.accountName },
            { label: 'Account Number', value: PAYMENT_DETAILS.accountNumber },
            { label: 'Amount', value: `₦${pricing.premium_badge.toLocaleString()}` }].
            map(({ label, value }) =>
            <div key={label} className="flex items-center justify-between gap-2 bg-muted rounded-lg px-3 py-2 hidden">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                  <button onClick={() => handleCopy(value)} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
            )}
            </div>

            {payBtnState === 'ready' ?
          <div className="space-y-2">
                <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium text-center px-4 py-3">
                  ✅ Your badge will be added within 24 hours!
                </div>
                <Button className="w-full" variant="outline" onClick={() => setStep(2)}>
                  Submit Transaction Reference
                </Button>
              </div> :

          <Button
            className="w-full"
            onClick={payBtnState === 'idle' ? handlePaymentClick : undefined}
            disabled={payBtnState === 'pending'}>
            
                {payBtnState === 'pending' ? '⏳ Pending...' : "I've made the payment — Continue"}
              </Button>
          }
          </div> :

        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter your transaction reference and upload your payment screenshot so we can verify your payment quickly.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Reference *</label>
              <Input
              placeholder="e.g. TRX-20240611-001234"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)} />
            
            </div>
            
            {/* Screenshot Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Payment Screenshot *</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                {screenshotUrl ?
              <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Screenshot uploaded!</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Image className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {screenshotFile?.name}
                      </span>
                    </div>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setScreenshotFile(null);
                    setScreenshotUrl(null);
                  }}
                  className="text-xs">
                  
                      Upload Different Image
                    </Button>
                  </div> :

              <div className="space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Upload your payment receipt screenshot
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, WEBP
                    </p>
                    <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="premium-screenshot-upload" />
                
                    <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={uploading}>
                  
                      <label htmlFor="premium-screenshot-upload" className="cursor-pointer">
                        {uploading ? '⏳ Uploading...' : '📷 Choose Image'}
                      </label>
                    </Button>
                  </div>
              }
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes (optional)</label>
              <Textarea
              placeholder="Any extra info about your payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20 resize-none" />
            
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading || !txRef.trim() || !screenshotUrl || uploading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '✅ Submit Payment'}
              </Button>
            </div>
          </div>
        }
      </DialogContent>
    </Dialog>);

}