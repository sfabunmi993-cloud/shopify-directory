import React from 'react';
import { Headphones, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Central support contact details — change here to update everywhere.
export const SUPPORT_PHONE = '9077410691';

export default function SupportContactBar() {
  const openSupportChat = () => {
    // Dispatch a custom event the global SupportChat widget listens for.
    window.dispatchEvent(new CustomEvent('open-support-chat'));
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
      <h2 className="font-semibold text-base mb-1 flex items-center gap-2">
        <Headphones className="w-4 h-4 text-muted-foreground" /> Need Help?
      </h2>
      <p className="text-xs text-muted-foreground mb-4">Reach our support team instantly — WhatsApp, call, or text.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button asChild className="rounded-full w-full bg-[#25D366] hover:bg-[#1ebe5d]">
          <a href={`https://wa.me/2349077410691`} target="_blank" rel="noopener noreferrer">
            <MessageSquare className="w-4 h-4 mr-1.5" /> WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full w-full">
          <a href={`tel:+2349077410691`}>
            <Phone className="w-4 h-4 mr-1.5" /> Voice Call
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full w-full">
          <a href={`sms:+2349077410691`}>
            <MessageSquare className="w-4 h-4 mr-1.5" /> SMS
          </a>
        </Button>
      </div>
    </div>
  );
}