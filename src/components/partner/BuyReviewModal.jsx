import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, AlertCircle, Check } from 'lucide-react';
import { usePricing } from '@/hooks/usePricing';
import { base44 } from '@/api/base44Client';
import PaystackCardCheckout from './PaystackCardCheckout';

export default function BuyReviewModal({ isOpen, onClose, partner }) {
  const { pricing } = usePricing();
  const PACKAGES = [
    { reviews: 5, price: pricing.reviews_5, label: '5 Reviews', popular: true },
    { reviews: 10, price: pricing.reviews_10 || pricing.reviews_5 * 1.8, label: '10 Reviews', popular: false },
    { reviews: 20, price: pricing.reviews_20 || pricing.reviews_5 * 3.5, label: '20 Reviews', popular: false }
  ];

  const [selected, setSelected] = useState(5);
  const [btnState, setBtnState] = useState('idle'); // idle | pending | done
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setBtnState('idle');
      setSelected(5);
    }
  }, [isOpen]);

  const handleDone = async ({ method, last4 }) => {
    setBtnState('pending');

    const pkg = PACKAGES.find((p) => p.reviews === selected);

    await base44.entities.Payment.create({
      user_id: user?.id || '',
      user_name: user?.full_name || '',
      user_email: user?.email || '',
      partner_id: partner?.id || '',
      partner_name: partner?.name || '',
      amount: pkg?.price || 0,
      description: `Buy Reviews — ${pkg?.label} package (₦${pkg?.price?.toLocaleString()}) via ${method}${last4 ? ` (card ending ${last4})` : ''}`,
      status: 'pending'
    });

    setBtnState('done');
  };

  const pkg = PACKAGES.find((p) => p.reviews === selected);

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
            <p>Purchase verified reviews to boost your profile ranking. Enter your payment details below.</p>
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

          {btnState === 'done' ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Payment Submitted!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your review purchase has been received. An admin will review and activate your reviews within 24 hours.
              </p>
              <Button className="rounded-full w-full" onClick={onClose}>Done</Button>
            </div>
          ) : (
            <PaystackCardCheckout
              amount={pkg?.price || 0}
              partnerName={partner?.name}
              submitting={btnState === 'pending'}
              onSubmit={handleDone}
            />
          )}
          </>}
        </div>
      </DialogContent>
    </Dialog>
  );
}