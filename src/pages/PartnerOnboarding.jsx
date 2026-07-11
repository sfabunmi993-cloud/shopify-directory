import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Plus, Loader2, ArrowRight, ArrowLeft, Sparkles, Tag } from 'lucide-react';

const STEPS = ['Basic Info', 'Services', 'Details'];

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

export default function PartnerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [existingPartner, setExistingPartner] = useState(null);
  const [checking, setChecking] = useState(true);
  const [newService, setNewService] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const [newTag, setNewTag] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    full_description: '',
    service_category: '',
    industry: '',
    services: [],
    tags: [],
    starting_price: '',
    location: '',
    country: '',
    website_url: '',
    email: '',
    languages: [],
    years_as_partner: '',
    completed_projects: '',
  });

  useEffect(() => {
    const checkExisting = async () => {
      const user = await base44.auth.me();
      const partners = await base44.entities.Partner.filter({ created_by_id: user.id });
      if (partners.length > 0) {
        navigate(`/partner/${partners[0].slug || partners[0].id}`);
      } else {
        setForm(prev => ({ ...prev, email: user.email || '' }));
      }
      setChecking(false);
    };
    checkExisting();
  }, [navigate]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleService = (service) => {
    set('services', form.services.includes(service)
      ? form.services.filter(s => s !== service)
      : [...form.services, service]);
  };

  const addCustomService = () => {
    const trimmed = newService.trim();
    if (trimmed && !form.services.includes(trimmed)) {
      set('services', [...form.services, trimmed]);
    }
    setNewService('');
  };

  const toggleLanguage = (lang) => {
    set('languages', form.languages.includes(lang)
      ? form.languages.filter(l => l !== lang)
      : [...form.languages, lang]);
  };

  const addTag = () => {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setNewTag('');
  };

  const removeTag = (t) => set('tags', form.tags.filter(tag => tag !== t));

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const handleSubmit = async () => {
    setSaving(true);
    // Generate a unique partner number
    const allPartners = await base44.entities.Partner.list('-created_date', 1);
    const lastNum = allPartners.length > 0
      ? parseInt(allPartners[0].partner_number?.replace('PB-', '') || '0', 10)
      : 0;
    const nextNum = String(lastNum + 1).padStart(5, '0');
    const partnerNumber = `PB-${nextNum}`;

    // Generate unique slug from name
    const baseSlug = generateSlug(form.name);
    const existingSlugs = await base44.entities.Partner.filter({ slug: baseSlug });
    const slug = existingSlugs.length > 0 ? `${baseSlug}${nextNum}` : baseSlug;

    const partner = await base44.entities.Partner.create({
      ...form,
      partner_number: partnerNumber,
      slug,
      starting_price: form.starting_price ? Number(form.starting_price) : undefined,
      years_as_partner: form.years_as_partner ? Number(form.years_as_partner) : 0,
      completed_projects: form.completed_projects ? Number(form.completed_projects) : 0,
      partner_tier: 'standard',
      is_featured: false,
      rating: 0,
      review_count: 0,
      completed_projects: 0,
      status: 'pending',
      flag_count: 0,
    });
    navigate(`/partner/${partner.slug || partner.id}`);
  };

  const canProceedStep0 = form.name.trim() && form.description.trim() && form.service_category;
  const canProceedStep1 = form.services.length > 0 && form.years_as_partner !== '';

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Partner Application
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Create your partner profile</h1>
          <p className="text-muted-foreground mt-2">Get listed in our directory and start connecting with clients</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${i === step ? 'text-primary' : i < step ? 'text-primary/60' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i === step ? 'bg-primary text-white border-primary' : i < step ? 'bg-primary/20 text-primary border-primary/40' : 'bg-muted text-muted-foreground border-border'}`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 max-w-16 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-semibold">Basic information</h2>

              <div className="space-y-1.5">
                <Label>Agency / Partner name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Acme Agency" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Short description <span className="text-destructive">*</span></Label>
                <Textarea placeholder="A one-line description of what you do..." value={form.description} onChange={e => set('description', e.target.value)} className="h-20 resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label>Full description</Label>
                <Textarea placeholder="Tell clients about your experience, approach, and what makes you different..." value={form.full_description} onChange={e => set('full_description', e.target.value)} className="h-32 resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label>Primary service category <span className="text-destructive">*</span></Label>
                <Select value={form.service_category} onValueChange={v => { set('service_category', v); set('services', []); }}>
                  <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Industry specialization</Label>
                <Select value={form.industry} onValueChange={v => set('industry', v)}>
                  <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full rounded-full" disabled={!canProceedStep0} onClick={() => setStep(1)}>
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 1: Services */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-semibold">Services you offer</h2>
              <p className="text-sm text-muted-foreground">Select all that apply. You can also add custom ones.</p>

              {form.service_category && (
                <div className="flex flex-wrap gap-2">
                  {(SUGGESTED_SERVICES[form.service_category] || []).map(s => (
                    <button
                      key={s}
                      onClick={() => toggleService(s)}
                      className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-all ${form.services.includes(s) ? 'bg-primary text-white border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}
                    >
                      {form.services.includes(s) && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom service..."
                  value={newService}
                  onChange={e => setNewService(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomService()}
                />
                <Button variant="outline" size="icon" onClick={addCustomService}><Plus className="w-4 h-4" /></Button>
              </div>

              {form.services.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Selected ({form.services.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.services.map(s => (
                      <Badge key={s} variant="secondary" className="gap-1 pr-1">
                        {s}
                        <button onClick={() => toggleService(s)} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button className="flex-1 rounded-full" disabled={!canProceedStep1} onClick={() => setStep(2)}>
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-semibold">Additional details</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>City &amp; Country (location)</Label>
                  <Input placeholder="e.g. New York, United States" value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Select value={form.country} onValueChange={v => set('country', v)}>
                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Starting price (USD)</Label>
                  <Input type="number" placeholder="e.g. 100" value={form.starting_price} onChange={e => set('starting_price', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact email</Label>
                  <Input type="email" placeholder="you@agency.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Years as a Shopify partner <span className="text-destructive">*</span></Label>
                  <Input type="number" min="0" placeholder="e.g. 3" value={form.years_as_partner} onChange={e => set('years_as_partner', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Completed projects</Label>
                  <Input type="number" min="0" placeholder="e.g. 50" value={form.completed_projects} onChange={e => set('completed_projects', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Website URL</Label>
                <Input type="url" placeholder="https://youragency.com" value={form.website_url} onChange={e => set('website_url', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Languages spoken</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES_LIST.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1 rounded-full text-sm border transition-all ${form.languages.includes(lang) ? 'bg-primary text-white border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags / Keywords</Label>
                <p className="text-xs text-muted-foreground">Add searchable tags to help clients find you (e.g. "ecommerce", "react", "b2b")</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                  />
                  <Button variant="outline" size="icon" onClick={addTag}><Plus className="w-4 h-4" /></Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        #{t}
                        <button onClick={() => removeTag(t)} className="hover:text-primary/60"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button className="flex-1 rounded-full" onClick={handleSubmit} disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Publishing...</> : <><CheckCircle className="w-4 h-4 mr-1.5" /> Publish Profile</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}