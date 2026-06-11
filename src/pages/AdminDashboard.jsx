import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Search, ShieldAlert, Users, Flag, Eye, Hash, Edit2, Star, BadgeCheck, CreditCard, DollarSign, Mail, Send, BarChart3, TrendingUp } from 'lucide-react';
import { DEFAULT_PRICING } from '@/hooks/usePricing';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  restricted: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [flags, setFlags] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [restrictDialog, setRestrictDialog] = useState(null);
  const [restrictReason, setRestrictReason] = useState('');
  const [editIdDialog, setEditIdDialog] = useState(null);
  const [newPartnerId, setNewPartnerId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [generatingReviews, setGeneratingReviews] = useState(null);
  const [reviewCountDialog, setReviewCountDialog] = useState(null);
  const [reviewCount, setReviewCount] = useState('10');
  const [emailBlastDialog, setEmailBlastDialog] = useState(false);
  const [blastSubject, setBlastSubject] = useState('');
  const [blastBody, setBlastBody] = useState('');
  const [sendingBlast, setSendingBlast] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/login'); return; }
      const user = await base44.auth.me();
      if (user.role !== 'admin') { navigate('/'); return; }
      loadData();
    };
    init();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const [allPartners, allFlags, allPayments] = await Promise.all([
      base44.entities.Partner.list('-created_date', 200),
      base44.entities.Flag.list('-created_date', 200),
      base44.entities.Payment.list('-created_date', 200),
    ]);
    setPartners(allPartners);
    setFlags(allFlags);
    setPayments(allPayments);
    setLoading(false);
  };

  const handleApprove = async (partner) => {
    setActionLoading(true);
    await base44.entities.Partner.update(partner.id, { status: 'approved' });
    toast.success(`${partner.name} approved!`);
    loadData();
    setActionLoading(false);
  };

  const handleRestrict = async () => {
    if (!restrictDialog) return;
    setActionLoading(true);
    await base44.entities.Partner.update(restrictDialog.id, {
      status: 'restricted',
      restriction_reason: restrictReason,
    });
    toast.success(`${restrictDialog.name} has been restricted.`);
    setRestrictDialog(null);
    setRestrictReason('');
    loadData();
    setActionLoading(false);
  };

  const handleEditPartnerId = async () => {
    if (!editIdDialog || !newPartnerId.trim()) return;
    setActionLoading(true);
    await base44.entities.Partner.update(editIdDialog.id, { partner_number: newPartnerId.trim() });
    toast.success(`Partner ID updated to ${newPartnerId.trim()}`);
    setEditIdDialog(null);
    setNewPartnerId('');
    loadData();
    setActionLoading(false);
  };

  const reviewPool = [
    { name: 'James O.', rating: 5, comment: 'Absolutely fantastic work! Delivered everything on time and exceeded my expectations. Highly recommended.' },
    { name: 'Sarah M.', rating: 5, comment: 'Professional, responsive, and incredibly skilled. My Shopify store looks amazing now. Will hire again!' },
    { name: 'David K.', rating: 5, comment: 'Outstanding service from start to finish. Clear communication and top-notch results. 5 stars!' },
    { name: 'Aisha B.', rating: 5, comment: 'Exceeded all expectations. The attention to detail was remarkable and the turnaround was very fast.' },
    { name: 'Chris T.', rating: 4, comment: 'Very good work overall. Minor revisions were handled quickly. Would definitely recommend to others.' },
    { name: 'Fatima Y.', rating: 5, comment: 'Best decision I made for my business! The results were immediate and the quality was superb.' },
    { name: 'Michael R.', rating: 5, comment: 'Incredible expertise and professionalism. Delivered a high-quality store that my customers love.' },
    { name: 'Linda A.', rating: 4, comment: 'Great experience working with this partner. Knowledgeable, patient, and delivered solid results.' },
    { name: 'Emmanuel N.', rating: 5, comment: 'Truly exceptional. From concept to launch, everything was handled seamlessly. Highly recommend!' },
    { name: 'Grace P.', rating: 5, comment: 'Transformed my online store completely! Sales have increased significantly since the redesign. Thank you!' },
    { name: 'Tunde A.', rating: 5, comment: 'Superb quality and attention to detail. My store conversion rate improved dramatically.' },
    { name: 'Blessing C.', rating: 5, comment: 'Very reliable and professional. Delivered ahead of schedule with excellent results.' },
    { name: 'Robert L.', rating: 4, comment: 'Great communication throughout the project. Delivered exactly what was promised.' },
    { name: 'Amaka U.', rating: 5, comment: 'Exceptional work ethic and quality output. I would hire them again without hesitation.' },
    { name: 'John E.', rating: 5, comment: 'Truly outstanding! My online store has never looked better. Sales up by 40%!' },
    { name: 'Ngozi O.', rating: 5, comment: 'One of the best decisions for my business. Highly professional and results-driven.' },
    { name: 'Kevin P.', rating: 4, comment: 'Solid work and very responsive. Would recommend to anyone needing Shopify help.' },
    { name: 'Chisom E.', rating: 5, comment: 'Amazing results in record time. The quality of work is simply unmatched.' },
    { name: 'Femi B.', rating: 5, comment: 'World-class service. Everything was done perfectly and the support was phenomenal.' },
    { name: 'Sandra W.', rating: 5, comment: 'Outstanding partnership. They understood my vision and executed it flawlessly.' },
  ];

  const handleGenerateReviews = async (partner, count) => {
    const n = Math.min(Math.max(parseInt(count) || 10, 1), reviewPool.length);
    setGeneratingReviews(partner.id);
    const templates = reviewPool.slice(0, n);
    for (const r of templates) {
      await base44.entities.Review.create({ partner_id: partner.id, reviewer_name: r.name, rating: r.rating, comment: r.comment });
    }
    const totalAdded = templates.reduce((s, r) => s + r.rating, 0);
    const newCount = (partner.review_count || 0) + n;
    const newRating = partner.review_count
      ? (((partner.rating || 0) * (partner.review_count || 0) + totalAdded) / newCount).toFixed(1)
      : (totalAdded / n).toFixed(1);
    await base44.entities.Partner.update(partner.id, { review_count: newCount, rating: parseFloat(newRating) });
    toast.success(`${n} reviews generated for ${partner.name}!`);
    setReviewCountDialog(null);
    setReviewCount('10');
    loadData();
    setGeneratingReviews(null);
  };

  const handleToggleVerify = async (partner) => {
    const newVal = !partner.is_verified;
    await base44.entities.Partner.update(partner.id, { is_verified: newVal });
    toast.success(newVal ? `${partner.name} verified!` : `Verification removed from ${partner.name}`);
    loadData();
  };

  const handleApprovePayment = async (payment) => {
    await base44.entities.Payment.update(payment.id, { status: 'approved' });
    // If this is a premium badge purchase, upgrade the partner tier
    if (payment.partner_id && payment.description?.includes('Premium Badge')) {
      await base44.entities.Partner.update(payment.partner_id, { partner_tier: 'premium' });
      toast.success('Payment approved & Premium badge granted!');
    } else {
      toast.success('Payment approved!');
    }
    // Send confirmation email to user
    try {
      await base44.functions.invoke('sendPaymentConfirmationEmail', {
        userEmail: payment.user_email,
        userName: payment.user_name,
        paymentType: payment.description || 'Purchase',
        amount: payment.amount,
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
      // Don't show error to admin - payment was still approved
    }
    loadData();
  };

  const handleRejectPayment = async (payment) => {
    await base44.entities.Payment.update(payment.id, { status: 'rejected' });
    toast.success('Payment rejected.');
    loadData();
  };

  const handleDismissFlag = async (flag) => {
    await base44.entities.Flag.update(flag.id, { status: 'dismissed' });
    toast.success('Flag dismissed');
    loadData();
  };

  const handleMarkFlagReviewed = async (flag) => {
    await base44.entities.Flag.update(flag.id, { status: 'reviewed' });
    toast.success('Flag marked as reviewed');
    loadData();
  };

  const filtered = partners.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name?.toLowerCase().includes(q) || p.partner_number?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
  });

  const pending = filtered.filter(p => p.status === 'pending');
  const approved = filtered.filter(p => p.status === 'approved');
  const restricted = filtered.filter(p => p.status === 'restricted');
  const pendingFlags = flags.filter(f => f.status === 'pending');
  const pendingPayments = payments.filter(p => p.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage partner accounts, approvals, and flags</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Partners</span>
          </div>
          <p className="text-2xl font-bold">{partners.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{partners.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-700">Approved</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{partners.filter(p => p.status === 'approved').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700">Open Flags</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{pendingFlags.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700">Pending Payments</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{pendingPayments.length}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="pending">
            Pending <Badge variant="secondary" className="ml-1.5">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved <Badge variant="secondary" className="ml-1.5">{approved.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="restricted">
            Restricted <Badge variant="secondary" className="ml-1.5">{restricted.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments <Badge variant="secondary" className="ml-1.5">{pendingPayments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="flags">
            Flags <Badge variant="secondary" className="ml-1.5">{pendingFlags.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pricing">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="email-blast">
            <Mail className="w-4 h-4 mr-1.5" />
            Email Blast
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-1.5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PartnerList partners={pending} onApprove={handleApprove} onRestrict={setRestrictDialog} onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} onGenerateReviews={(p) => { setReviewCountDialog(p); setReviewCount('10'); }} generatingReviews={generatingReviews} onToggleVerify={handleToggleVerify} showApprove />
        </TabsContent>
        <TabsContent value="approved">
          <PartnerList partners={approved} onRestrict={setRestrictDialog} onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} onGenerateReviews={(p) => { setReviewCountDialog(p); setReviewCount('10'); }} generatingReviews={generatingReviews} onToggleVerify={handleToggleVerify} />
        </TabsContent>
        <TabsContent value="restricted">
          <PartnerList partners={restricted} onApprove={handleApprove} onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} onGenerateReviews={(p) => { setReviewCountDialog(p); setReviewCount('10'); }} generatingReviews={generatingReviews} onToggleVerify={handleToggleVerify} showApprove />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentList payments={payments} onApprove={handleApprovePayment} onReject={handleRejectPayment} />
        </TabsContent>
        <TabsContent value="flags">
          <FlagList flags={pendingFlags} partners={partners} onDismiss={handleDismissFlag} onReviewed={handleMarkFlagReviewed} />
        </TabsContent>
        <TabsContent value="pricing">
          <PricingSettings />
        </TabsContent>
        <TabsContent value="email-blast">
          <EmailBlastSection
            onOpenDialog={() => setEmailBlastDialog(true)}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <PartnerAnalytics
            analyticsData={analyticsData}
            loading={analyticsLoading}
            onRefresh={async () => {
              setAnalyticsLoading(true);
              try {
                const res = await base44.functions.invoke('getPartnerAnalytics', {});
                setAnalyticsData(res.data);
              } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to load analytics');
              }
              setAnalyticsLoading(false);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Partner ID Dialog */}
      <Dialog open={!!editIdDialog} onOpenChange={() => { setEditIdDialog(null); setNewPartnerId(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Partner ID</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Change the partner ID number for <strong>{editIdDialog?.name}</strong>.
          </p>
          <Input
            placeholder="e.g. PB-00042"
            value={newPartnerId}
            onChange={e => setNewPartnerId(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditIdDialog(null); setNewPartnerId(''); }}>Cancel</Button>
            <Button onClick={handleEditPartnerId} disabled={!newPartnerId.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Hash className="w-4 h-4 mr-1.5" /> Save ID</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Reviews Dialog */}
      <Dialog open={!!reviewCountDialog} onOpenChange={() => { setReviewCountDialog(null); setReviewCount('10'); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Reviews</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            How many reviews do you want to generate for <strong>{reviewCountDialog?.name}</strong>? (max 20)
          </p>
          <Input
            type="number"
            min="1"
            max="20"
            placeholder="e.g. 10"
            value={reviewCount}
            onChange={e => setReviewCount(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewCountDialog(null); setReviewCount('10'); }}>Cancel</Button>
            <Button
              onClick={() => handleGenerateReviews(reviewCountDialog, reviewCount)}
              disabled={!reviewCount || generatingReviews === reviewCountDialog?.id}
            >
              {generatingReviews === reviewCountDialog?.id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Star className="w-4 h-4 mr-1.5" /> Generate {reviewCount || 0} Reviews</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Blast Dialog */}
      <Dialog open={emailBlastDialog} onOpenChange={setEmailBlastDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email Blast to All Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <Mail className="w-4 h-4" />
                Email Blast Information
              </p>
              <p>This will send an email to all registered users in the app. Use this for important updates, announcements, or platform-wide notifications.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input
                placeholder="e.g. Important Platform Update"
                value={blastSubject}
                onChange={e => setBlastSubject(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                placeholder="Write your message here..."
                value={blastBody}
                onChange={e => setBlastBody(e.target.value)}
                className="h-48 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEmailBlastDialog(false); setBlastSubject(''); setBlastBody(''); }}>Cancel</Button>
            <Button 
              onClick={async () => {
                setSendingBlast(true);
                try {
                  const res = await base44.functions.invoke('sendEmailBlast', {
                    subject: blastSubject,
                    body: blastBody,
                  });
                  toast.success(res.data.message || 'Email blast sent successfully!');
                  setEmailBlastDialog(false);
                  setBlastSubject('');
                  setBlastBody('');
                } catch (err) {
                  toast.error(err.response?.data?.error || 'Failed to send email blast');
                }
                setSendingBlast(false);
              }}
              disabled={!blastSubject.trim() || !blastBody.trim() || sendingBlast}
            >
              {sendingBlast ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <><Send className="w-4 h-4 mr-1.5" /> Send to All Users</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restrict Dialog */}
      <Dialog open={!!restrictDialog} onOpenChange={() => { setRestrictDialog(null); setRestrictReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restrict Account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Restricting <strong>{restrictDialog?.name}</strong> will hide them from the directory. Please provide a reason.
          </p>
          <Textarea
            placeholder="Reason for restriction..."
            value={restrictReason}
            onChange={e => setRestrictReason(e.target.value)}
            className="h-24 resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRestrictDialog(null); setRestrictReason(''); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleRestrict} disabled={!restrictReason.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldAlert className="w-4 h-4 mr-1.5" /> Restrict Account</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getPartnerRank(reviewCount = 0) {
  if (reviewCount >= 25) return { label: 'Plus', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (reviewCount >= 5) return { label: 'Pro', color: 'bg-primary/10 text-primary border-primary/20' };
  return { label: 'Basic', color: 'bg-muted text-muted-foreground border-border' };
}

function PaymentList({ payments, onApprove, onReject }) {
  if (payments.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No payments submitted yet.</p>;
  }
  const STATUS_COLORS = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className="space-y-3">
      {payments.map(pay => (
        <div key={pay.id} className="bg-white border border-border rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{pay.user_name || pay.user_email || 'User'}</p>
              {pay.partner_name && <span className="text-xs text-muted-foreground">→ {pay.partner_name}</span>}
              <Badge variant="outline" className={`text-xs ${STATUS_COLORS[pay.status]}`}>{pay.status}</Badge>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">${pay.amount?.toLocaleString()}</p>
            {pay.description && <p className="text-xs text-muted-foreground mt-0.5">{pay.description}</p>}
            <p className="text-xs text-muted-foreground mt-1">{pay.created_date ? format(new Date(pay.created_date), 'MMM d, yyyy') : ''}</p>
          </div>
          {pay.status === 'pending' && (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full text-emerald-700 border-emerald-200 hover:bg-emerald-50" onClick={() => onApprove(pay)}>
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="rounded-full text-red-700 border-red-200 hover:bg-red-50" onClick={() => onReject(pay)}>
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PartnerList({ partners, onApprove, onRestrict, onEditId, onGenerateReviews, generatingReviews, onToggleVerify, showApprove }) {
  if (partners.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No partners in this category.</p>;
  }
  return (
    <div className="space-y-3">
      {partners.map(p => {
        const rank = getPartnerRank(p.review_count);
        return (
          <div key={p.id} className="bg-white border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {p.logo_url
                ? <img src={p.logo_url} className="w-10 h-10 rounded-lg object-cover" alt={p.name} />
                : <span className="font-bold text-primary">{p.name?.charAt(0)}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{p.name}</p>
                {p.partner_number && <span className="text-xs text-muted-foreground font-mono">#{p.partner_number}</span>}
                <Badge variant="outline" className={`text-xs ${STATUS_STYLES[p.status] || ''}`}>{p.status}</Badge>
                <Badge variant="outline" className={`text-xs ${rank.color}`}>{rank.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{p.description}</p>
              {p.restriction_reason && (
                <p className="text-xs text-red-600 mt-1">Reason: {p.restriction_reason}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link to={`/partner/${p.id}`}><Eye className="w-4 h-4" /></Link>
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit Partner ID" onClick={() => onEditId(p)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`rounded-full gap-1 ${p.is_verified ? 'text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                title={p.is_verified ? 'Remove verification' : 'Grant verification badge'}
                onClick={() => onToggleVerify(p)}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{p.is_verified ? 'Verified' : 'Verify'}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-amber-700 border-amber-200 hover:bg-amber-50 gap-1"
                title="Generate reviews"
                onClick={() => onGenerateReviews(p)}
                disabled={generatingReviews === p.id}
              >
                {generatingReviews === p.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Star className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Reviews</span>
              </Button>
              {showApprove && (
                <Button size="sm" variant="outline" className="rounded-full text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => onApprove(p)}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
              )}
              {p.status !== 'restricted' && (
                <Button size="sm" variant="outline" className="rounded-full text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => onRestrict(p)}>
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Restrict
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmailBlastSection({ onOpenDialog }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-blue-900">Email Blast</h3>
            <p className="text-sm text-blue-700 mt-1">
              Send important updates and announcements to all registered users via Gmail.
            </p>
          </div>
        </div>
        <div className="bg-white/80 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 font-medium mb-2">Use cases:</p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Platform updates and new features</li>
            <li>Important announcements</li>
            <li>Policy changes</li>
            <li>System maintenance notifications</li>
          </ul>
        </div>
        <Button onClick={onOpenDialog} className="w-full bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />
          Compose Email Blast
        </Button>
      </div>
    </div>
  );
}

function PartnerAnalytics({ analyticsData, loading, onRefresh }) {
  useEffect(() => {
    if (!analyticsData) {
      onRefresh();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analyticsData || analyticsData.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No analytics data available yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Make sure your Google Analytics is tracking partner page views.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Partner Profile Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Data from {analyticsData.period?.start} to {analyticsData.period?.end}
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {analyticsData.map((partner, index) => (
          <div
            key={partner.partner_id}
            className="bg-white border border-border rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{partner.partner_name}</p>
                <Badge variant="outline" className="text-xs">
                  {partner.slug}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Page Views</p>
                <p className="text-lg font-bold text-foreground">{partner.total_page_views?.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Events</p>
                <p className="text-lg font-bold text-foreground">{partner.total_events?.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-lg font-bold text-foreground">{partner.total_users?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSettings() {
  const [prices, setPrices] = useState({ ...DEFAULT_PRICING });
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'pricing' }).then(records => {
      if (records.length > 0) {
        setPrices({ ...DEFAULT_PRICING, ...records[0].value });
        setSettingsId(records[0].id);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    if (settingsId) {
      await base44.entities.AppSettings.update(settingsId, { value: prices });
    } else {
      const rec = await base44.entities.AppSettings.create({ key: 'pricing', value: prices });
      setSettingsId(rec.id);
    }
    toast.success('Prices saved!');
    setSaving(false);
  };

  const fields = [
    { key: 'premium_badge', label: 'Premium Badge', prefix: '$', suffix: 'USD' },
    { key: 'reviews_1', label: '1 Review Package', prefix: '₦', suffix: 'NGN' },
    { key: 'reviews_3', label: '3 Reviews Package', prefix: '₦', suffix: 'NGN' },
    { key: 'reviews_5', label: '5 Reviews Package', prefix: '₦', suffix: 'NGN' },
  ];

  return (
    <div className="max-w-md space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold flex items-center gap-1.5 mb-1"><DollarSign className="w-4 h-4" /> Pricing Settings</p>
        <p>Changes here instantly update the prices shown to partners in the Buy Reviews and Premium Badge modals.</p>
      </div>
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        {fields.map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm font-medium">{f.label}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-4">{f.prefix}</span>
              <Input
                type="number"
                min="0"
                value={prices[f.key] ?? ''}
                onChange={e => setPrices(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{f.suffix}</span>
            </div>
          </div>
        ))}
        <Button className="w-full mt-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Prices'}
        </Button>
      </div>
    </div>
  );
}

function FlagList({ flags, partners, onDismiss, onReviewed }) {
  if (flags.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No pending flags. Great!</p>;
  }
  return (
    <div className="space-y-3">
      {flags.map(flag => {
        const partner = partners.find(p => p.id === flag.partner_id);
        return (
          <div key={flag.id} className="bg-white border border-red-100 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">
                  {partner?.name || 'Unknown Partner'}
                  {partner?.partner_number && <span className="ml-2 text-xs font-mono text-muted-foreground">#{partner.partner_number}</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    {flag.reason?.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {flag.created_date ? format(new Date(flag.created_date), 'MMM d, yyyy') : ''}
                  </span>
                </div>
                {flag.details && <p className="text-xs text-muted-foreground mt-2">{flag.details}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {partner && (
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link to={`/partner/${partner.id}`}><Eye className="w-4 h-4" /></Link>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => onReviewed(flag)}>
                  Mark Reviewed
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => onDismiss(flag)}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}