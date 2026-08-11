import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PaystackCardCheckout from './PaystackCardCheckout';
import { usePricing } from '@/hooks/usePricing';

export default function BuyDomainModal({ partner, isOpen, onClose, user }) {
  const { pricing } = usePricing();
  const DOMAIN_PRICE = pricing.domain_purchase || 10000;
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async ({ method, last4 }) => {
    setSubmitting(true);

    await base44.entities.Payment.create({
      user_id: user?.id,
      user_name: user?.full_name,
      user_email: user?.email,
      partner_id: partner?.id,
      partner_name: partner?.name,
      amount: DOMAIN_PRICE,
      description: `Domain Purchase - ${partner?.name} via ${method}${last4 ? ` (card ending ${last4})` : ''}`,
      status: 'pending'
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] p-4 sm:p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
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
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Domain Package</p>
              <p className="text-sm text-muted-foreground">Custom domain setup and configuration for your partner profile.</p>
            </div>

            <PaystackCardCheckout
              amount={DOMAIN_PRICE}
              partnerName={partner?.name}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          </div>
        }
      </DialogContent>
    </Dialog>);
}