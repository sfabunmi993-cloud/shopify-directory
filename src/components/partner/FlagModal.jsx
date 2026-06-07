import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Flag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const REASONS = [
  { value: 'spam', label: 'Spam or unsolicited content' },
  { value: 'fraud', label: 'Fraudulent or scam activity' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'misrepresentation', label: 'Misleading or false information' },
  { value: 'other', label: 'Other' },
];

export default function FlagModal({ partner, isOpen, onClose }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSending(true);
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { toast.error('Please log in to report.'); setSending(false); return; }
    const user = await base44.auth.me();

    await base44.entities.Flag.create({
      partner_id: partner.id,
      reporter_id: user.id,
      reason,
      details: details.trim(),
      status: 'pending',
    });

    // increment flag count
    await base44.entities.Partner.update(partner.id, {
      flag_count: (partner.flag_count || 0) + 1,
    });

    setSending(false);
    setSent(true);
    toast.success('Report submitted. Our team will review it.');
    setTimeout(() => {
      setSent(false);
      setReason('');
      setDetails('');
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {partner.name}</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold">Report submitted</p>
            <p className="text-sm text-muted-foreground mt-1">Thank you for helping keep our community safe.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Help us maintain quality by reporting policy violations. Reports are reviewed by our admin team.
            </p>

            <div className="space-y-1.5">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Additional details</Label>
              <Textarea
                placeholder="Please provide more context..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="h-24 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-full" onClick={onClose}>Cancel</Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-full"
                onClick={handleSubmit}
                disabled={!reason || sending}
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Submitting...</>
                  : <><Flag className="w-4 h-4 mr-1.5" /> Submit Report</>
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}