import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem } from
'@/components/ui/select';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const COUNTRIES = [
'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
'Netherlands', 'Spain', 'Italy', 'Sweden', 'Norway', 'Denmark', 'Finland',
'Switzerland', 'Ireland', 'Belgium', 'Austria', 'Portugal', 'Brazil', 'Mexico',
'Argentina', 'Chile', 'Colombia', 'Japan', 'South Korea', 'Singapore',
'United Arab Emirates', 'Saudi Arabia', 'Israel', 'South Africa', 'Nigeria',
'Kenya', 'Egypt', 'Morocco', 'Ghana', 'India', 'Pakistan', 'Bangladesh',
'Indonesia', 'Philippines', 'Malaysia', 'Thailand', 'Vietnam', 'New Zealand',
'Other'];


export default function ContactModal({ partner, isOpen, onClose, mode = 'inquiry' }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    store_url: '',
    country: '',
    service: '',
    budget: '',
    collaborator_code: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const me = await base44.auth.me();
          setForm((prev) => ({
            ...prev,
            full_name: me.full_name || '',
            email: me.email || ''
          }));
        }
      };
      init();
    }
  }, [isOpen, partner]);

  const requiredFieldsFilled =
  form.full_name.trim() &&
  form.email.trim() &&
  form.country.trim() &&
  form.service.trim() &&
  form.budget.trim() &&
  form.message.trim();

  const handleSend = async () => {
    if (!requiredFieldsFilled) return;
    setSending(true);
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      toast.error('Please log in to send messages.');
      setSending(false);
      return;
    }
    const user = await base44.auth.me();
    const convId = `${user.id}-${partner.id}-${Date.now()}`;
    const partnerRecords = await base44.entities.Partner.filter({ id: partner.id });
    const partnerUserId = partnerRecords[0]?.created_by_id || null;

    await base44.entities.Message.create({
      conversation_id: convId,
      partner_id: partner.id,
      partner_user_id: partnerUserId,
      client_user_id: user.id,
      sender_id: user.id,
      sender_name: form.full_name.trim() || user.full_name || user.email,
      sender_role: 'user',
      subject: `Inquiry from ${form.full_name.trim()}`,
      body: form.message.trim(),
      message_type: mode === 'hire' ? 'hire_request' : 'inquiry',
      client_full_name: form.full_name.trim(),
      client_email: form.email.trim(),
      client_budget: form.budget.trim(),
      client_store_url: form.store_url.trim() || undefined,
      client_country: form.country,
      client_service: form.service,
      collaborator_code: form.collaborator_code.trim() || undefined,
      is_read: false
    });

    setSending(false);
    setSent(true);
    toast.success('Message sent!');
    setTimeout(() => {
      setSent(false);
      setForm({
        full_name: '', email: '', store_url: '', country: '',
        service: '', budget: '', collaborator_code: '', message: ''
      });
      onClose();
    }, 1500);
  };

  const partnerServices = partner?.services || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md px-6 mx-3 my-48">
        <DialogHeader>
          <DialogTitle>Contact {partner.name}</DialogTitle>
          <DialogDescription>
            Share a few details to help them understand your needs. They'll follow up with you directly.
          </DialogDescription>
        </DialogHeader>

        {sent ?
        <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold">Message sent successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">{partner.name} will respond shortly.</p>
          </div> :

        <div className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label>Full name <span className="text-destructive">*</span></Label>
              <Input
              placeholder="Your full name"
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)} />
            
            </div>

            {/* Business email */}
            <div className="space-y-1.5">
              <Label>Business email <span className="text-destructive">*</span></Label>
              <Input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)} />
            
            </div>

            {/* Store URL (optional) */}
            <div className="space-y-1.5">
              <Label>Select the store you're working on (optional)</Label>
              <Input
              type="url"
              placeholder="https://your-store.myshopify.com"
              value={form.store_url}
              onChange={(e) => set('store_url', e.target.value)} />
            
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <Label>Country <span className="text-destructive">*</span></Label>
              <Select value={form.country} onValueChange={(v) => set('country', v)}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Service */}
            <div className="space-y-1.5">
              <Label>Select a service offered by {partner.name} <span className="text-destructive">*</span></Label>
              <Select value={form.service} onValueChange={(v) => set('service', v)}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  {partnerServices.length > 0 ?
                partnerServices.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>) :
                <SelectItem value="general" disabled>No services listed</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <Label>Budget (USD) <span className="text-destructive">*</span></Label>
              <Input
              type="text"
              placeholder="e.g. 500"
              value={form.budget}
              onChange={(e) => set('budget', e.target.value)} />
            
            </div>

            {/* Collaborator code */}
            <div className="space-y-1.5">
              <Label>Collaborator code (optional)</Label>
              <Input
              placeholder="Your Shopify collaborator code"
              value={form.collaborator_code}
              onChange={(e) => set('collaborator_code', e.target.value)} />
            
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label>What do you need help with? <span className="text-destructive">*</span></Label>
              <Textarea
              placeholder="Describe your project or question..."
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              className="h-28 resize-y" />
            
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground">
              Partners listed in the directory work independently to provide you with the best service.
            </p>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" className="flex-1 rounded-full" onClick={onClose}>Cancel</Button>
              <Button
              className="flex-1 rounded-full"
              onClick={handleSend}
              disabled={!requiredFieldsFilled || sending}>
              
                {sending ?
              <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending...</> :
              <><Send className="w-4 h-4 mr-1.5" /> Submit</>
              }
              </Button>
            </div>
          </div>
        }
      </DialogContent>
    </Dialog>);

}