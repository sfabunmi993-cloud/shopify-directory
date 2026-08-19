import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, X, Plus, CheckCircle, Camera, Hash, ShieldAlert, ShieldCheck, Clock, Share2, Star, TrendingUp, Upload, ImageIcon, Lock, Bell, Globe, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InquiriesDashboard from '@/components/profile/InquiriesDashboard';
import ServiceDescriptionEditor from '@/components/profile/ServiceDescriptionEditor';
import ProjectsSection from '@/components/profile/ProjectsSection';
import BuyReviewModal from '@/components/partner/BuyReviewModal';
import PurchasePremiumModal from '@/components/partner/PurchasePremiumModal';
import BuyDomainModal from '@/components/partner/BuyDomainModal';
import PortfolioEditor from '@/components/profile/PortfolioEditor';
import TestimonialsEditor from '@/components/profile/TestimonialsEditor';
import AppealForm from '@/components/partner/AppealForm';
import SupportContactBar from '@/components/profile/SupportContactBar';
import CoAdminInviteBanner from '@/components/profile/CoAdminInviteBanner';
import { partnerProfilePath, partnerProfileUrl } from '@/lib/partnerUrl';

const SERVICE_CATEGORIES = [
{ label: 'Marketing and sales', value: 'marketing_and_sales' },
{ label: 'Store setup and management', value: 'store_setup_and_management' },
{ label: 'Development and troubleshooting', value: 'development_and_troubleshooting' },
{ label: 'Visual content and branding', value: 'visual_content_and_branding' },
{ label: 'Content writing', value: 'content_writing' },
{ label: 'Expert guidance', value: 'expert_guidance' }];


const SUGGESTED_SERVICES = {
  marketing_and_sales: ['SEO', 'Social media marketing', 'Email marketing', 'Search engine advertising', 'Content marketing', 'Analytics and tracking', 'Sales channel setup', 'Conversion rate optimization'],
  store_setup_and_management: ['Store build or redesign', 'Theme customization', 'Store migration', 'Product and collection setup', 'Ongoing website management', 'Troubleshooting', 'Custom domain setup'],
  development_and_troubleshooting: ['Custom apps and integrations', 'Systems integration', 'Headless commerce', 'Troubleshooting', 'Site performance and speed', 'Checkout upgrade', 'Wholesale/B2B'],
  visual_content_and_branding: ['Logo and visual branding', 'Product photography', 'Video and illustrations', 'Banner ads', '3D modelling'],
  content_writing: ['Product descriptions', 'Website and marketing content', 'Email marketing', 'Content marketing', 'SEO'],
  expert_guidance: ['Business strategy guidance', 'International expansion', 'Product sourcing guidance', 'Sales tax guidance', 'Wholesale/B2B', 'Product development']
};

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 'France', 'Nigeria', 'Brazil', 'Singapore', 'South Africa', 'Other'];

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
{ label: 'Other', value: 'other' }];

const LANGUAGES_LIST = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Portuguese', 'Arabic', 'Mandarin', 'Japanese', 'Tamil'];

export default function MyProfile() {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buyReviewOpen, setBuyReviewOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [buyDomainOpen, setBuyDomainOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [newService, setNewService] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [form, setForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actingAs, setActingAs] = useState(null);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      setUser(user);
      // Admin "act as" mode: edit another user's partner profile on their behalf.
      const params = new URLSearchParams(window.location.search);
      const actAsId = params.get('actAs');
      if (actAsId && user.role === 'admin') {
        try {
          const p = await base44.entities.Partner.get(actAsId);
          if (p) {
            setPartner(p);
            setForm({ ...p });
            setActingAs(p.name || 'this user');
            setLoading(false);
            return;
          }
        } catch (_) { /* fall through to the admin's own profile */ }
      }
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

  const [searchParams] = useSearchParams();
  const [highlightT, setHighlightT] = useState(false);
  useEffect(() => {
    if (searchParams.get('focus') !== 'testimonials' || loading) return;
    const el = document.getElementById('testimonials-section');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightT(true);
    const t = setTimeout(() => setHighlightT(false), 4500);
    return () => clearTimeout(t);
  }, [searchParams, loading]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleService = (service) => {
    const services = form.services || [];
    set('services', services.includes(service) ? services.filter((s) => s !== service) : [...services, service]);
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
    set('languages', languages.includes(lang) ? languages.filter((l) => l !== lang) : [...languages, lang]);
  };

  const addTag = () => {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    const tags = form.tags || [];
    if (t && !tags.includes(t)) set('tags', [...tags, t]);
    setNewTag('');
  };

  const removeTag = (t) => set('tags', (form.tags || []).filter((tag) => tag !== t));

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingScreenshot(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('dashboard_screenshot_url', file_url);
    await base44.entities.Partner.update(partner.id, { dashboard_screenshot_url: file_url });
    toast.success('Dashboard screenshot uploaded!');
    setUploadingScreenshot(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('logo_url', file_url);
    await base44.entities.Partner.update(partner.id, { logo_url: file_url });
    toast.success('Logo updated!');
    setUploadingLogo(false);
  };

  const handleSave = async () => {
    setSaving(true);
    let updates = { ...form, starting_price: form.starting_price ? Number(form.starting_price) : undefined, years_as_partner: form.years_as_partner ? Number(form.years_as_partner) : 0, completed_projects: form.completed_projects ? Number(form.completed_projects) : 0 };
    // Regenerate slug if name changed
    if (form.name && form.name !== partner.name) {
      const baseSlug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const existing = await base44.entities.Partner.filter({ slug: baseSlug });
      const conflict = existing.find((p) => p.id !== partner.id);
      updates.slug = conflict ? `${baseSlug}${partner.partner_number?.replace('PB-', '') || Date.now()}` : baseSlug;
    }
    await base44.entities.Partner.update(partner.id, updates);
    // Update local partner state so links reflect new slug immediately
    const updatedPartner = { ...partner, ...updates };
    setPartner(updatedPartner);
    setForm(updatedPartner);
    toast.success('Profile updated successfully!');
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke('deleteUserAccount', {});
      toast.success('Your account data has been permanently deleted.');
      setDeleteOpen(false);
      base44.auth.logout('/login');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>);

  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {actingAs && (
        <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="font-semibold text-indigo-900">Acting as {actingAs}</span>
            <span className="text-indigo-700 hidden sm:inline">— edits save to this partner's profile.</span>
          </div>
          <Button size="sm" variant="outline" className="rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-100" onClick={() => navigate('/admin')}>
            <X className="w-4 h-4 mr-1" /> Exit
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
          <Button
              onClick={() => setBuyReviewOpen(true)}
              className="rounded-full hover:bg-amber-600 text-white gap-1.5 shadow-sm bg-gray-600"
              size="sm">
              
            <Star className="w-4 h-4 fill-white" /> Buy Reviews
          </Button>
          {!partner?.domain_purchased &&
            <button
              onClick={() => setBuyDomainOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold border border-blue-200 rounded-full px-2.5 py-0.5 w-fit hover:bg-blue-100 transition-colors bg-blue-600 text-white">
              <Globe className="w-3 h-3" /> Buy Domain
            </button>
            }
          {partner?.is_verified ?
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span> :

            <button
              onClick={() => setPremiumOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold border border-amber-200 rounded-full px-2.5 py-0.5 w-fit hover:bg-amber-100 transition-colors bg-gray-900 text-gray-50">
              
              ✨ Buy Verification Badge
            </button>
            }
          </div>
          <div class="min-w-0">
            <h1 className="font-heading text-xl sm:text-2xl font-bold">My Partner Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Edit how you appear in the directory</p>
            {partner?.partner_number &&
            <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {partner.partner_number}</p>
            }
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs"
            onClick={() => {
              const url = partnerProfileUrl(partner?.slug || partner?.id);
              navigator.clipboard.writeText(url);
              toast.success('Profile link copied to clipboard!');
            }}>
            
            <Share2 className="w-4 h-4 mr-1.5" /> Share Profile
          </Button>
          <Button asChild variant="outline" className="rounded-full text-xs" size="sm">
            <Link to={partnerProfilePath(partner?.slug || partner?.id)}><Eye className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">View </span>Profile</Link>
          </Button>
        </div>
      </div>

      <SupportContactBar />

      <CoAdminInviteBanner />

      {/* Rank Banner */}
      {partner && (() => {
        const reviewCount = partner.review_count || 0;
        const rank = reviewCount >= 25 ? 'Plus' : reviewCount >= 5 ? 'Pro' : 'Basic';
        const nextRank = rank === 'Basic' ? 'Pro' : rank === 'Pro' ? 'Plus' : null;
        const nextAt = rank === 'Basic' ? 5 : rank === 'Pro' ? 25 : null;
        const rankColor = rank === 'Plus' ? 'bg-amber-50 border-amber-200 text-amber-700' : rank === 'Pro' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground';
        return (
          <div className={`mb-4 rounded-xl px-4 py-3 border flex items-center justify-between ${rankColor}`}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">Partner Rank: {rank}</span>
              {nextRank && <span className="text-xs opacity-80">· {reviewCount}/{nextAt} reviews to reach {nextRank}</span>}
              {!nextRank && <span className="text-xs opacity-80">· Top rank achieved!</span>}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3.5 h-3.5" />
              {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </div>
          </div>);

      })()}

      {/* Admin Banner */}
      {partner?.admin_banner &&
      <div className="mb-4 bg-orange-50 border border-orange-300 rounded-xl px-4 py-3 flex items-start gap-2 text-orange-800 text-sm">
          <Bell className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
          <div>
            <p className="font-semibold text-orange-900 mb-0.5">Message from Admin</p>
            <p>{partner.admin_banner}</p>
          </div>
        </div>
      }

      {/* Status Banner */}
      {partner?.status === 'pending' &&
      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-amber-700 text-sm">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span><strong>Pending approval.</strong> Your profile is under review. You'll be visible in the directory once approved by an admin.</span>
          </div>
          <button
          onClick={() => setBuyDomainOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors">
          
            <Globe className="w-3.5 h-3.5" /> Buy Domain
          </button>
        </div>
      }
      {partner?.status === 'approved' &&
      <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2 text-emerald-700 text-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span><strong>Approved.</strong> Your profile is live and visible in the directory.</span>
        </div>
      }
      {partner?.status === 'restricted' &&
      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span><strong>Account restricted.</strong> {partner.restriction_reason || 'Your account has been restricted by an admin.'}</span>
          </div>
          <p className="mt-2 text-xs text-red-600">Write an appeal below to restore your account automatically.</p>
          <AppealForm
          onResolved={() => {
            const restored = { ...partner, status: 'approved', restriction_reason: '' };
            setPartner(restored);
            setForm(restored);
          }} />
        
        </div>
      }

      {/* Inquiries Dashboard */}
      





      

      {/* Delivered Projects */}
      



      

      <div className="bg-white border border-border rounded-2xl p-4 sm:p-6 space-y-6">
        {/* Basic */}
        <div>
          <h2 className="font-semibold text-base mb-4">Basic information</h2>
          <div className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-1.5">
              <Label>Logo / Profile image</Label>
              <div className="flex items-center gap-4">
                {form.logo_url ?
                <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border/50" /> :

                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50">
                    <span className="text-4xl">{partner?.review_count >= 25 ? '🥇' : partner?.review_count >= 5 ? '🥈' : '🥉'}</span>
                  </div>
                }
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-full text-sm font-medium hover:bg-muted/50 transition-colors">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {uploadingLogo ? 'Uploading...' : 'Change image'}
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Agency / Partner name</Label>
              <Input value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Short description</Label>
              <Textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} className="h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Full description</Label>
              <Textarea value={form.full_description || ''} onChange={(e) => set('full_description', e.target.value)} className="h-32 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Primary service category</Label>
              <Select value={form.service_category || ''} onValueChange={(v) => set('service_category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Industry specialization</Label>
              <Select value={form.industry || ''} onValueChange={(v) => set('industry', v)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Services */}
        <div>
          <h2 className="font-semibold text-base mb-4">Services</h2>
          {form.service_category &&
          <div className="flex flex-wrap gap-2 mb-3">
              {(SUGGESTED_SERVICES[form.service_category] || []).map((s) =>
            <button
              key={s}
              onClick={() => toggleService(s)}
              className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-all ${(form.services || []).includes(s) ? 'bg-primary text-white border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}>
              
                  {(form.services || []).includes(s) && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                  {s}
                </button>
            )}
            </div>
          }
          <div className="flex gap-2 mb-3">
            <Input placeholder="Add a custom service..." value={newService} onChange={(e) => setNewService(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomService()} />
            <Button variant="outline" size="icon" onClick={addCustomService}><Plus className="w-4 h-4" /></Button>
          </div>
          {(form.services || []).length > 0 &&
          <div className="flex flex-wrap gap-1.5 mb-4">
              {(form.services || []).map((s) =>
            <Badge key={s} variant="secondary" className="gap-1 pr-1">
                  {s}
                  <button onClick={() => toggleService(s)} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="w-3 h-3" /></button>
                </Badge>
            )}
            </div>
          }

          {(form.services || []).length > 0 &&
          <div>
              <p className="text-sm font-medium text-foreground mb-2">Service descriptions</p>
              <p className="text-xs text-muted-foreground mb-3">Add a description for each service. You can write your own or use AI to generate one.</p>
              <ServiceDescriptionEditor
              services={form.services || []}
              partnerName={form.name}
              serviceDescriptions={form.service_descriptions || {}}
              onChange={(v) => set('service_descriptions', v)} />
            
            </div>
          }
        </div>

        <hr className="border-border" />

        {/* Contact & Location */}
        <div>
          <h2 className="font-semibold text-base mb-4">Contact & Location</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Location (City, Country)</Label>
              <Input placeholder="e.g. London, United Kingdom" value={form.location || ''} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select value={form.country || ''} onValueChange={(v) => set('country', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Starting price (USD)</Label>
              <Input type="number" value={form.starting_price || ''} onChange={(e) => set('starting_price', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Partner since (year)</Label>
              <Input
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={form.years_as_partner ? new Date().getFullYear() - form.years_as_partner : ''}
                onChange={(e) => {
                  const year = Number(e.target.value);
                  set('years_as_partner', year ? Math.max(0, new Date().getFullYear() - year) : 0);
                }} />
              <p className="text-xs text-muted-foreground">The year you became a Shopify partner. Shown as "Partner since" on your public profile.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Completed projects</Label>
              <Input type="number" min="0" value={form.completed_projects || ''} onChange={(e) => set('completed_projects', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact email</Label>
              <Input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Website URL</Label>
              <Input type="url" placeholder="https://" value={form.website_url || ''} onChange={(e) => set('website_url', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp Link</Label>
              <Input type="url" placeholder="https://wa.me/1234567890" value={form.whatsapp_url || ''} onChange={(e) => set('whatsapp_url', e.target.value)} />
              <p className="text-xs text-muted-foreground">Format: https://wa.me/[your number with country code]</p>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Social Media */}
        <div>
          <h2 className="font-semibold text-base mb-4">Social Media Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Instagram URL</Label>
              <Input type="url" placeholder="https://instagram.com/yourhandle" value={form.instagram_url || ''} onChange={(e) => set('instagram_url', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Twitter / X URL</Label>
              <Input type="url" placeholder="https://x.com/yourhandle" value={form.twitter_url || ''} onChange={(e) => set('twitter_url', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn URL</Label>
              <Input type="url" placeholder="https://linkedin.com/company/yourcompany" value={form.linkedin_url || ''} onChange={(e) => set('linkedin_url', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Facebook URL</Label>
              <Input type="url" placeholder="https://facebook.com/yourpage" value={form.facebook_url || ''} onChange={(e) => set('facebook_url', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>TikTok URL</Label>
              <Input type="url" placeholder="https://tiktok.com/@yourhandle" value={form.tiktok_url || ''} onChange={(e) => set('tiktok_url', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>YouTube URL</Label>
              <Input type="url" placeholder="https://youtube.com/@yourchannel" value={form.youtube_url || ''} onChange={(e) => set('youtube_url', e.target.value)} />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Portfolio */}
        <div>
          <h2 className="font-semibold text-base mb-1">Portfolio</h2>
          <p className="text-xs text-muted-foreground mb-4">Upload up to 3 images or videos showcasing your work. These appear on your public profile.</p>
          <PortfolioEditor
            portfolio={form.portfolio || []}
            partnerId={partner?.id}
            onChange={(updated) => set('portfolio', updated)} />
          
        </div>

        <hr className="border-border" />

        {/* Testimonials */}
        <div
          id="testimonials-section"
          className={`rounded-xl transition-all duration-500 ${highlightT ? 'ring-4 ring-primary/40 bg-primary/5 p-3 -mx-3' : ''}`}>
          <h2 className="font-semibold text-base mb-1">Client Testimonials</h2>
          <p className="text-xs text-muted-foreground mb-4">Add up to 15 testimonials. They scroll automatically sideways on your public profile.</p>
          <TestimonialsEditor
            testimonials={form.testimonials || []}
            onChange={(updated) => set('testimonials', updated)} />
        </div>

        <hr className="border-border" />

        {/* Shopify Dashboard Screenshot */}
        <div>
          <h2 className="font-semibold text-base mb-1">Shopify Partner Dashboard Screenshot</h2>
          <p className="text-xs text-muted-foreground mb-4">Upload a screenshot of your Shopify Partner Dashboard to showcase your experience. It will be displayed on your public profile.</p>
          <div className="space-y-3">
            {form.dashboard_screenshot_url ?
            <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={form.dashboard_screenshot_url} alt="Dashboard screenshot" className="w-full object-cover" />
                <button
                onClick={() => set('dashboard_screenshot_url', '')}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white shadow text-foreground">
                
                  <X className="w-4 h-4" />
                </button>
              </div> :

            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <p className="text-sm">No screenshot uploaded yet</p>
              </div>
            }
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} disabled={uploadingScreenshot} />
              <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm font-medium hover:bg-muted/50 transition-colors w-fit">
                {uploadingScreenshot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingScreenshot ? 'Uploading...' : form.dashboard_screenshot_url ? 'Replace screenshot' : 'Upload screenshot'}
              </div>
            </label>
          </div>
        </div>

        <hr className="border-border" />

        {/* Tags */}
        <div>
          <h2 className="font-semibold text-base mb-1">Tags / Keywords</h2>
          <p className="text-xs text-muted-foreground mb-3">Searchable tags that help clients find you (e.g. "ecommerce", "b2b", "react")</p>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()} />
            
            <Button variant="outline" size="icon" onClick={addTag}><Plus className="w-4 h-4" /></Button>
          </div>
          {(form.tags || []).length > 0 &&
          <div className="flex flex-wrap gap-1.5">
              {(form.tags || []).map((t) =>
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  #{t}
                  <button onClick={() => removeTag(t)} className="hover:text-primary/60"><X className="w-3 h-3" /></button>
                </span>
            )}
            </div>
          }
        </div>

        <hr className="border-border" />

        {/* Languages */}
        <div>
          <h2 className="font-semibold text-base mb-3">Languages spoken</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {LANGUAGES_LIST.map((lang) =>
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${(form.languages || []).includes(lang) ? 'bg-primary text-white border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}>
                {lang}
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a custom language..."
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const trimmed = newLanguage.trim();
                  if (trimmed && !(form.languages || []).includes(trimmed)) {
                    set('languages', [...(form.languages || []), trimmed]);
                  }
                  setNewLanguage('');
                }
              }} />
            
            <Button variant="outline" size="icon" onClick={() => {
              const trimmed = newLanguage.trim();
              if (trimmed && !(form.languages || []).includes(trimmed)) {
                set('languages', [...(form.languages || []), trimmed]);
              }
              setNewLanguage('');
            }}><Plus className="w-4 h-4" /></Button>
          </div>
          {(form.languages || []).filter((l) => !LANGUAGES_LIST.includes(l)).length > 0 &&
          <div className="flex flex-wrap gap-1.5">
              {(form.languages || []).filter((l) => !LANGUAGES_LIST.includes(l)).map((l) =>
            <Badge key={l} variant="secondary" className="gap-1 pr-1">
                  {l}
                  <button onClick={() => toggleLanguage(l)} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="w-3 h-3" /></button>
                </Badge>
            )}
            </div>
          }
        </div>

        <div className="pt-2">
          <Button className="w-full rounded-full" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-1.5" /> Save Changes</>}
          </Button>
        </div>
      </div>

      {/* Settings */}
      {!actingAs && (
      <div className="bg-white border border-border rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" /> Account Settings
        </h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Change your password</p>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} />
            
          </div>
          <div className="space-y-1.5">
            <Label>Confirm new password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} />
            
          </div>
          <Button
            className="rounded-full"
            disabled={savingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            onClick={async () => {
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                toast.error('Passwords do not match');
                return;
              }
              if (passwordForm.newPassword.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
              }
              setSavingPassword(true);
              try {
                await base44.auth.updateMe({ password: passwordForm.newPassword });
                toast.success('Password updated successfully!');
                setPasswordForm({ newPassword: '', confirmPassword: '' });
              } catch (err) {
                toast.error(err.message || 'Failed to update password');
              } finally {
                setSavingPassword(false);
              }
            }}>
            
            {savingPassword ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Updating...</> : 'Update Password'}
          </Button>
        </div>
      </div>
      )}

      {/* Delete Account */}
      {!actingAs && (
      <div className="bg-white border border-destructive/30 rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
        <h2 className="font-semibold text-base mb-2 flex items-center gap-2 text-destructive">
          <Trash2 className="w-4 h-4" /> Delete Account
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your partner profile, favorites, messages, reviews, and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="outline"
          className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-1.5" /> Delete my account
        </Button>
      </div>
      )}

      <BuyReviewModal isOpen={buyReviewOpen} onClose={() => setBuyReviewOpen(false)} partner={partner} />
      <PurchasePremiumModal partner={partner} isOpen={premiumOpen} onClose={() => setPremiumOpen(false)} user={user} />
      <BuyDomainModal partner={partner} isOpen={buyDomainOpen} onClose={() => setBuyDomainOpen(false)} user={user} />

      <Dialog open={deleteOpen} onOpenChange={(o) => !deleting && setDeleteOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete account permanently?
            </DialogTitle>
            <DialogDescription>
              This will permanently erase your partner profile, favorites, messages, projects, reviews, payments, and flags. <strong>This action is irreversible</strong> and your data cannot be recovered. You will be signed out immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Deleting…</> : <><Trash2 className="w-4 h-4 mr-1.5" /> Yes, delete forever</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}