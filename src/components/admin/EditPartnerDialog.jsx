import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const INDUSTRIES = [
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Finance', value: 'finance' },
  { label: 'Retail', value: 'retail' },
  { label: 'Education', value: 'education' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Creative', value: 'creative' },
  { label: 'Other', value: 'other' },
];

const SERVICE_CATEGORIES = [
  { label: 'Marketing and sales', value: 'marketing_and_sales' },
  { label: 'Store setup and management', value: 'store_setup_and_management' },
  { label: 'Development and troubleshooting', value: 'development_and_troubleshooting' },
  { label: 'Visual content and branding', value: 'visual_content_and_branding' },
  { label: 'Content writing', value: 'content_writing' },
  { label: 'Expert guidance', value: 'expert_guidance' },
];

const TIERS = [
  { label: 'Standard', value: 'standard' },
  { label: 'Plus', value: 'plus' },
  { label: 'Premium', value: 'premium' },
];

export default function EditPartnerDialog({ partner, open, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [servicesText, setServicesText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (partner) {
      setForm({
        name: partner.name || '',
        email: partner.email || '',
        location: partner.location || '',
        country: partner.country || '',
        description: partner.description || '',
        full_description: partner.full_description || '',
        service_category: partner.service_category || '',
        industry: partner.industry || '',
        partner_tier: partner.partner_tier || 'standard',
        website_url: partner.website_url || '',
        whatsapp_url: partner.whatsapp_url || '',
        starting_price: partner.starting_price != null ? String(partner.starting_price) : '',
        years_as_partner: partner.years_as_partner != null ? String(partner.years_as_partner) : '',
        completed_projects: partner.completed_projects != null ? String(partner.completed_projects) : '',
        partner_number: partner.partner_number || '',
      });
      setServicesText((partner.services || []).join(', '));
    }
  }, [partner]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const services = servicesText.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...form,
        services,
        starting_price: form.starting_price ? Number(form.starting_price) : undefined,
        years_as_partner: form.years_as_partner ? Number(form.years_as_partner) : 0,
        completed_projects: form.completed_projects ? Number(form.completed_projects) : 0,
      };
      await base44.entities.Partner.update(partner.id, payload);
      toast.success(`${partner.name} updated!`);
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error('Failed to update partner');
    }
    setSaving(false);
  };

  if (!partner) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Partner Details — {partner.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Partner Name *</Label>
              <Input value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Partner Number</Label>
              <Input value={form.partner_number || ''} onChange={e => set('partner_number', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location || ''} onChange={e => set('location', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Service Category</Label>
              <Select value={form.service_category} onValueChange={v => set('service_category', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={v => set('industry', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Partner Tier</Label>
              <Select value={form.partner_tier} onValueChange={v => set('partner_tier', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Starting Price (USD)</Label>
              <Input type="number" value={form.starting_price || ''} onChange={e => set('starting_price', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Short Description</Label>
            <Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} className="h-16 resize-none" />
          </div>

          <div className="space-y-1.5">
            <Label>Full Description</Label>
            <Textarea value={form.full_description || ''} onChange={e => set('full_description', e.target.value)} className="h-28 resize-none" />
          </div>

          <div className="space-y-1.5">
            <Label>Services (comma separated)</Label>
            <Input value={servicesText} onChange={e => setServicesText(e.target.value)} placeholder="SEO, Store build, Theme customization" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Years as Partner</Label>
              <Input type="number" value={form.years_as_partner || ''} onChange={e => set('years_as_partner', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Completed Projects</Label>
              <Input type="number" value={form.completed_projects || ''} onChange={e => set('completed_projects', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={form.country || ''} onChange={e => set('country', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Website URL</Label>
              <Input type="url" value={form.website_url || ''} onChange={e => set('website_url', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp URL</Label>
              <Input type="url" value={form.whatsapp_url || ''} onChange={e => set('whatsapp_url', e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name?.trim()}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}