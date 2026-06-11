import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactModal({ partner, isOpen, onClose, mode = 'inquiry' }) {
  const [form, setForm] = useState({ subject: '', body: '', hire_details: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSend = async () => {
    if (!form.body.trim()) return;
    setSending(true);
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      toast.error('Please log in to send messages.');
      setSending(false);
      return;
    }
    const user = await base44.auth.me();
    const convId = `${user.id}-${partner.id}-${Date.now()}`;
    // Resolve partner's user account ID so they can see the message
    const partnerRecords = await base44.entities.Partner.filter({ id: partner.id });
    const partnerUserId = partnerRecords[0]?.created_by_id || null;
    await base44.entities.Message.create({
      conversation_id: convId,
      partner_id: partner.id,
      partner_user_id: partnerUserId,
      client_user_id: user.id,
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      sender_role: 'user',
      subject: form.subject || (mode === 'hire' ? `Hire Request from ${user.full_name || user.email}` : `Inquiry from ${user.full_name || user.email}`),
      body: form.body.trim(),
      message_type: mode === 'hire' ? 'hire_request' : 'inquiry',
      hire_details: mode === 'hire' ? form.hire_details : undefined,
      is_read: false,
    });
    setSending(false);
    setSent(true);
    toast.success(mode === 'hire' ? 'Hire request sent!' : 'Message sent!');
    setTimeout(() => {
      setSent(false);
      setForm({ subject: '', body: '', hire_details: '' });
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'hire' ? `Hire ${partner.name}` : `Contact ${partner.name}`}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold">Message sent successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">The partner will respond shortly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                placeholder={mode === 'hire' ? "Project title or scope" : "What's this about?"}
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
              />
            </div>

            {mode === 'hire' && (
              <div className="space-y-1.5">
                <Label>Project details <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Describe your project, budget, and timeline..."
                  value={form.hire_details}
                  onChange={e => set('hire_details', e.target.value)}
                  className="h-24 resize-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Message <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder={mode === 'hire' ? "Any additional information or questions..." : "Your message to this partner..."}
                value={form.body}
                onChange={e => set('body', e.target.value)}
                className="h-28 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-full" onClick={onClose}>Cancel</Button>
              <Button
                className="flex-1 rounded-full"
                onClick={handleSend}
                disabled={!form.body.trim() || sending}
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending...</>
                  : <><Send className="w-4 h-4 mr-1.5" /> {mode === 'hire' ? 'Send Hire Request' : 'Send Message'}</>
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}