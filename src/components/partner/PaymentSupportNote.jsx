import { MessageSquare } from 'lucide-react';

const PHONE = '+2349077410691';

export default function PaymentSupportNote() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
      <p className="text-xs text-amber-800 leading-snug">
        Are you facing a problem with payment? Contact us via SMS.
      </p>
      <a
        href={`sms:${PHONE}`}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-amber-700 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {PHONE}
      </a>
    </div>
  );
}