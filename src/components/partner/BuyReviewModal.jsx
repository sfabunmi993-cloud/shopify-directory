import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Copy, Check, CreditCard, AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePricing } from '@/hooks/usePricing';
import { base44 } from '@/api/base44Client';

export default function BuyReviewModal({ isOpen, onClose, partner }) {
  const { pricing } = usePricing();
  const PACKAGES = [
  { reviews: 5, price: pricing.reviews_5, label: '5 Reviews', popular: true },
  { reviews: 10, price: pricing.reviews_10 || pricing.reviews_5 * 1.8, label: '10 Reviews', popular: false },
  { reviews: 20, price: pricing.reviews_20 || pricing.reviews_5 * 3.5, label: '20 Reviews', popular: false }];


  const [selected, setSelected] = useState(5);
  const [copied, setCopied] = useState('');
  const [btnState, setBtnState] = useState('idle'); // idle | pending | done
  const [user, setUser] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setBtnState('idle');
      setSelected(5);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDone = async () => {
    if (!screenshotFile) {
      toast.error('Please upload your payment screenshot first.');
      return;
    }
    setBtnState('pending');
    setUploading(true);

    const pkg = PACKAGES.find((p) => p.reviews === selected);

    // Upload screenshot
    const { file_url } = await base44.integrations.Core.UploadFile({ file: screenshotFile });
    setUploading(false);

    await base44.entities.Payment.create({
      user_id: user?.id || '',
      user_name: user?.full_name || '',
      user_email: user?.email || '',
      partner_id: partner?.id || '',
      partner_name: partner?.name || '',
      amount: pkg?.price || 0,
      description: `Buy Reviews — ${pkg?.label} package (₦${pkg?.price?.toLocaleString()}) | Receipt: ${file_url}`,
      status: 'pending'
    });

    setBtnState('done');
  };

  const pkg = PACKAGES.find((p) => p.reviews === selected);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md px-8 py-4 mx-3 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Buy Reviews
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {<>
          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Purchase verified reviews to boost your profile ranking. Pay via OPay and upload your receipt below.</p>
          </div>

          {/* Package selection */}
          <div>
            <p className="text-sm font-semibold mb-2">Choose a package</p>
            <div className="grid grid-cols-3 gap-2">
              {PACKAGES.map((p) =>
                <button
                  key={p.reviews}
                  onClick={() => setSelected(p.reviews)}
                  className={`relative rounded-xl border-2 p-3 text-center transition-all ${selected === p.reviews ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                  {p.popular &&
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Popular</span>
                  }
                  <div className="flex justify-center gap-0.5 mb-1">
                    {[...Array(Math.min(p.reviews, 5))].map((_, i) =>
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-muted-foreground">₦{p.price.toLocaleString()}</p>
                </button>
                )}
            </div>
          </div>

          {/* Payment details */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" /> PalmPay Payment Details
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="font-semibold">7031665045</p>
                  </div>
                  <button onClick={() => copyText('9068191624', 'phone')} className="text-muted-foreground hover:text-foreground">
                  {copied === 'phone' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-semibold">FABUNMI RONKE</p>
                </div>
                <button onClick={() => copyText('FABUNMI RONKE', 'name')} className="text-muted-foreground hover:text-foreground">
                  {copied === 'name' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-primary/30 bg-primary/5">
                <div>
                  <p className="text-xs text-muted-foreground">Amount to Pay</p>
                  <p className="font-bold text-primary text-base">₦{pkg?.price.toLocaleString()}</p>
                </div>
                <button onClick={() => copyText(`${pkg?.price}`, 'amount')} className="text-muted-foreground hover:text-foreground">
                  {copied === 'amount' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <p className="text-sm font-semibold mb-2">Upload Payment Screenshot <span className="text-red-500">*</span></p>
            {screenshotPreview ?
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={screenshotPreview} alt="Payment receipt" className="w-full max-h-48 object-cover" />
                <button
                  onClick={removeScreenshot}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div> :

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all">
                <Upload className="w-6 h-6" />
                <span className="text-sm">Tap to upload your payment receipt</span>
              </button>
              }
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange} />
              
          </div>

          {/* Instructions */}
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Send <strong>₦{pkg?.price.toLocaleString()}</strong> to PalmPay: <strong>9068191624 (FABUNMI RONKE)</strong></li>
            <li>Take a screenshot of your payment receipt</li>
            <li>Upload the screenshot using the upload box above</li>
            <li>Your {pkg?.reviews} review{pkg?.reviews > 1 ? 's' : ''} will be posted within 24 hours</li>
          </ol>

          {btnState === 'done' ?
            <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium text-center px-4 py-3">
              ✅ Payment received! Your reviews will be added within 24 hours.
            </div> :

            <Button
              className="w-full rounded-full"
              onClick={btnState === 'idle' ? handleDone : undefined}
              disabled={btnState === 'pending' || !screenshotFile}>
              {uploading ? '⏳ Uploading...' : btnState === 'pending' ? '⏳ Submitting...' : "Done — I've made the payment"}
            </Button>
            }
          </>}
        </div>
      </DialogContent>
    </Dialog>);

}