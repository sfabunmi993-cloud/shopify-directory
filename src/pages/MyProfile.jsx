import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, X, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SERVICE_CATEGORIES = [
  { label: 'Marketing and sales', value: 'marketing_and_sales' },
  { label: 'Store setup and management', value: 'store_setup_and_management' },
  { label: 'Development and troubleshooting', value: 'development_and_troubleshooting' },
  { label: 'Visual content and branding', value: 'visual_content_and_branding' },
  { label: 'Content writing', value: 'content_writing' },
  { label: 'Expert guidance', value: 'expert_guidance' },
];

const SUGGESTED_SERVICES = {
  marketing_and_sales: ['SEO', 'Social media marketing', 'Email marketing', 'Search engine advertising', 'Content marketing', 'Analytics and tracking', 'Sales channel setup', 'Conversion rate optimization'],
  store_setup_and_management: ['Store build or redesign', 'Theme customization', 'Store migration', 'Product and collection setup', 'Ongoing website management', 'Troubleshooting', 'Custom domain setup'],
  development_and_troubleshooting: ['Custom apps and integrations', 'Systems integration', 'Headless commerce', 'Troubleshooting', 'Site performance and speed', 'Checkout upgrade', 'Wholesale/B2B'],
  visual_content_and_branding: ['Logo and visual branding', 'Product photography', 'Video and illustrations', 'Banner ads', '3D modelling'],
  content_writing: ['Product descriptions', 'Website and marketing content', 'Email marketing', 'Content marketing', 'SEO'],
  expert_guidance: ['Business strategy guidance', 'International expansion', 'Product sourcing guidance', 'Sales tax guidance', 'Wholesale/B2B', 'Product development'],
};

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 'France', 'Nigeria', 'Brazil', 'Singapore', 'South Africa', 'Other'];
const LANGUAGES_LIST = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Portuguese', 'Arabic', 'Mandarin', 'Japanese', 'Tamil'];

export default function MyProfile() {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState('');
  const [form, setForm] = useState({});

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const partners = await base44.entities.Partner.filter({ created_by_id: user.id });
      if (partners.length > 0) {
        const p = partners[0];
        setPartner(p);
        setForm({ ...p });
      } else {
        navigate('/become-a-partner');
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleService = (service) => {
    const services = form.services || [];
    set('services', services.includes(service) ? services.filter(s => s !== service) : [...services, service]);
  };

  const addCustomService = () => {
    const trimmed = newService.trim();
    if (trimmed && !(form.services || []).includes(trimmed)) {
      set('services', [...(form.services || []), trimmed]);
    }
    setNewService('');
  };

  const toggleLanguage = (lang) => {
    const languages = form.languages || [];
    set('languages', languages.includes(lang) ? languages.filter(l => l !== lang) : [...languages, lang]);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Partner.update(partner.id, {
      ...form,
      starting_price: form.starting_price ? Number(form.starting_price) : undefined,
    });
    toast.success('Profile updated successfully!');
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Partner Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit how you appear in the directory</p>
        </div>
        <Button asChild variant="outline" className="rounded-full" size="sm">
          <Link to={`/partner/${partner?.id}`}><Eye className="w-4 h-4 mr-1.5" /> View Public Profile</Link>
        </Button>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 space-y-6">
        {/* Basic */}
        <div>
          <h2 className="font-semibold text-base mb-4">Basic information</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Agency / Partner name</Label>
              <Input value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Short description</Label>
              <Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} className="h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Full description</Label>
              <Textarea value={form.full_description || ''} onChange={e => set('full_description', e.target.value)} className="h-32 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Primary service category</Label>
              <Select value={form.service_category || ''} onValueChange={v => set('service_category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Services */}
        <div>
          <h2 className="font-semibold text-base mb-4">Services</h2>
          {form.service_category && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(SUGGESTED_SERVICES[form.service_category] || []).map(s => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-all ${(form.services || []).includes(s) ? 'bg-primary text-white border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}
                >
                  {(form.services || []).includes(s) && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 mb-3">
            <Input placeholder="Add a custom service..." value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomService()} />
            <Button variant="outline" size="icon" onClick={addCustomService}><Plus className="w-4 h-4" /></Button>
          </div>
          {(form.services || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(form.services || []).map(s => (
                <Badge key={s} variant="secondary" className="gap-1 pr-1">
                  {s}
                  <button onClick={() => toggleService(s)} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Contact & Location */}
        <div>
          <h2 className="font-semibold text-base mb-4">Contact & Location</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Location (City, Country)</Label>
              <Input placeholder="e.g. London, United Kingdom" value={form.location || ''} onChange={e => set('location', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select value={form.country || ''} onValueChange={v => set('country', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Starting price (USD)</Label>
              <Input type="number" value={form.starting_price || ''} onChange={e => set('starting_price', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact email</Label>
              <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Website URL</Label>
              <Input type="url" placeholder="https://" value={form.website_url || ''} onChange={e => set('website_url', e.target.value)} />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Languages */}
        <div>
          <h2 className="font-semibold text-base mb-3">Languages spoken</h2>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES_LIST.map(lang => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1 rounded-full text-sm border transition-all ${(form.languages || []).includes(lang) ? 'bg-primary text-white border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button className="w-full rounded-full" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-1.5" /> Save Changes</>}
          </Button>
        </div>
      </div>
    </div>
  );
}