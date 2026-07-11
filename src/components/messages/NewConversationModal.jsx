import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Loader2, Search, Send, CheckCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import PartnerAvatar from '@/components/directory/PartnerAvatar';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'Spain', 'Italy', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Switzerland', 'Ireland', 'Belgium', 'Austria', 'Portugal', 'Brazil', 'Mexico',
  'Argentina', 'Chile', 'Colombia', 'Japan', 'South Korea', 'Singapore',
  'United Arab Emirates', 'Saudi Arabia', 'Israel', 'South Africa', 'Nigeria',
  'Kenya', 'Egypt', 'Morocco', 'Ghana', 'India', 'Pakistan', 'Bangladesh',
  'Indonesia', 'Philippines', 'Malaysia', 'Thailand', 'Vietnam', 'New Zealand',
  'Other',
];

export default function NewConversationModal({ isOpen, onClose, user, onCreated }) {
  const [step, setStep] = useState('pick');
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    store_url: '',
    country: '',
    service: '',
    budget: '',
    collaborator_code: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!isOpen) {
      setStep('pick');
      setSearch('');
      setSelectedPartner(null);
      setSent(false);
      setForm({
        full_name: '', email: '', store_url: '', country: '',
        service: '', budget: '', collaborator_code: '', message: '',
      });
    } else {
      if (user) {
        setForm(prev => ({
          ...prev,
          full_name: user.full_name || '',
          email: user.email || '',
        }));
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPartners = async () => {
      setLoadingPartners(true);
      const results = await base44.entities.Partner.filter({ status: 'approved' }, 'name', 50);
      setPartners(results);
      setLoadingPartners(false);
    };
    fetchPartners();
  }, [isOpen]);

  const filtered = partners.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const requiredFieldsFilled =
    form.full_name.trim() &&
    form.email.trim() &&
    form.country.trim() &&
    form.service.trim() &&
    form.budget.trim() &&
    form.message.trim();

  const handleSend = async () => {
    if (!requiredFieldsFilled) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    const conversationId = `conv_${user.id}_${selectedPartner.id}_${Date.now()}`;
    await base44.entities.Message.create({
      conversation_id: conversationId,
      partner_id: selectedPartner.id,
      partner_user_id: selectedPartner.created_by_id,
      client_user_id: user.id,
      sender_id: user.id,
      sender_name: form.full_name.trim() || user.full_name || user.email,
      sender_role: 'user',
      subject: `Inquiry from ${form.full_name.trim()}`,
      body: form.message.trim(),
      message_type: 'inquiry',
      client_full_name: form.full_name.trim(),
      client_email: form.email.trim(),
      client_budget: form.budget.trim(),
      client_store_url: form.store_url.trim() || undefined,
      client_country: form.country,
      client_service: form.service,
      collaborator_code: form.collaborator_code.trim() || undefined,
      is_read: false,
    });
    setSending(false);
    setSent(true);
    toast.success('Message sent!');
    setTimeout(() => {
      onClose();
      onCreated?.();
    }, 1200);
  };

  const partnerServices = selectedPartner?.services || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        {step === 'pick' ? (
          <>
            <DialogHeader>
              <DialogTitle>Choose a Partner</DialogTitle>
              <DialogDescription>Select a partner to contact from the directory.</DialogDescription>
            </DialogHeader>
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
              <div className="max-h-72 overflow-y-auto space-y-1 border border-border rounded-lg divide-y divide-border">
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
          </>
        ) : sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold">Message sent successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">{selectedPartner?.name} will respond shortly.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Contact {selectedPartner?.name}</DialogTitle>
              <DialogDescription>
                Share a few details to help them understand your needs. They'll follow up with you directly.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <PartnerAvatar partner={selectedPartner} size="sm" shape="rounded-full" />
              <div>
                <p className="text-sm font-semibold">{selectedPartner?.name}</p>
                <button onClick={() => setStep('pick')} className="text-xs text-primary hover:underline inline-flex items-center gap-0.5">
                  <ChevronLeft className="w-3 h-3" /> Change partner
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full name <span className="text-destructive">*</span></Label>
                <Input placeholder="Your full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Business email <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Select the store you're working on (optional)</Label>
                <Input type="url" placeholder="https://your-store.myshopify.com" value={form.store_url} onChange={e => set('store_url', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Country <span className="text-destructive">*</span></Label>
                <Select value={form.country} onValueChange={v => set('country', v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Select a service offered by {selectedPartner?.name} <span className="text-destructive">*</span></Label>
                <Select value={form.service} onValueChange={v => set('service', v)}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {partnerServices.length > 0
                      ? partnerServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                      : <SelectItem value="general" disabled>No services listed</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Budget (USD) <span className="text-destructive">*</span></Label>
                <Input type="text" placeholder="e.g. 500" value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Collaborator code (optional)</Label>
                <Input placeholder="Your Shopify collaborator code" value={form.collaborator_code} onChange={e => set('collaborator_code', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>What do you need help with? <span className="text-destructive">*</span></Label>
                <Textarea placeholder="Describe your project or question..." value={form.message} onChange={e => set('message', e.target.value)} className="h-28 resize-y" />
              </div>

              <p className="text-xs text-muted-foreground">
                Partners listed in the directory work independently to provide you with the best service.
              </p>

              <div className="flex gap-2 pt-1">
                <Button variant="ghost" className="flex-1 rounded-full" onClick={() => setStep('pick')}>Back</Button>
                <Button className="flex-1 rounded-full" onClick={handleSend} disabled={!requiredFieldsFilled || sending}>
                  {sending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-1.5" /> Submit</>}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}