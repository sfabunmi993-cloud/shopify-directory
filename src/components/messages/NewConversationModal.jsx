import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import PartnerAvatar from '@/components/directory/PartnerAvatar';

export default function NewConversationModal({ isOpen, onClose, user, onCreated }) {
  const [step, setStep] = useState('pick'); // 'pick' | 'compose'
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) { setStep('pick'); setSearch(''); setSelectedPartner(null); setSubject(''); setBody(''); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      setLoadingPartners(true);
      const results = await base44.entities.Partner.filter({ status: 'approved' }, 'name', 50);
      setPartners(results);
      setLoadingPartners(false);
    };
    fetch();
  }, [isOpen]);

  const filtered = partners.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!body.trim()) { toast.error('Please write a message.'); return; }
    setSending(true);
    const conversationId = `conv_${user.id}_${selectedPartner.id}_${Date.now()}`;
    await base44.entities.Message.create({
      conversation_id: conversationId,
      partner_id: selectedPartner.id,
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      sender_role: 'user',
      subject: subject.trim() || undefined,
      body: body.trim(),
      message_type: 'inquiry',
      is_read: false,
    });
    toast.success('Message sent!');
    setSending(false);
    onClose();
    onCreated?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'pick' ? 'Choose a Partner' : `Message ${selectedPartner?.name}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'pick' ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 border border-border rounded-lg divide-y divide-border">
              {loadingPartners ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No partners found</p>
              ) : filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPartner(p); setStep('compose'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                >
                  <PartnerAvatar partner={p} size="sm" shape="rounded-full" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.location || p.service_category?.replace(/_/g, ' ')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <PartnerAvatar partner={selectedPartner} size="sm" shape="rounded-full" />
              <div>
                <p className="text-sm font-semibold">{selectedPartner?.name}</p>
                <button onClick={() => setStep('pick')} className="text-xs text-primary hover:underline">Change partner</button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subject (optional)</Label>
              <Input placeholder="e.g. Store setup inquiry" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea
                placeholder="Describe your project or question..."
                className="h-28 resize-none"
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setStep('pick')}>Back</Button>
              <Button className="flex-1" onClick={handleSend} disabled={sending || !body.trim()}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}