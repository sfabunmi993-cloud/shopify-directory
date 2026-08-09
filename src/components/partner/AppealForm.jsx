import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AppealForm({ onResolved }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!text.trim()) {
      toast.error('Please write your appeal.');
      return;
    }
    setSending(true);
    try {
      await base44.functions.invoke('submitAppeal', { appealText: text.trim() });
      toast.success('Appeal submitted! Your account has been restored.');
      setText('');
      onResolved?.();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to submit appeal.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        placeholder="Write your appeal explaining why your account should be restored..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-24 resize-none bg-white"
      />
      <Button onClick={submit} disabled={sending} className="rounded-full w-full sm:w-auto">
        {sending
          ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Submitting...</>
          : <><ShieldCheck className="w-4 h-4 mr-1.5" /> Submit Appeal & Restore Account</>}
      </Button>
    </div>
  );
}