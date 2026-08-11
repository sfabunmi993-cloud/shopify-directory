import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Search, ShieldAlert, Users, Flag, Eye, EyeOff, Hash, Edit2, Star, BadgeCheck, CreditCard, DollarSign, Mail, Send, BarChart3, TrendingUp, Megaphone, Plus, Trash2, Infinity, Bell, Landmark } from 'lucide-react';
import AnnouncementsSection from '@/components/admin/AnnouncementsSection';
import AdsSection from '@/components/admin/AdsSection';
import BroadcastUpdateSection from '@/components/admin/BroadcastUpdateSection';
import PartnerList from '@/components/admin/PartnerList';
import EditPartnerDialog from '@/components/admin/EditPartnerDialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [blastSenderName, setBlastSenderName] = useState('');
  const [blastSenderEmail, setBlastSenderEmail] = useState('');
  const [blastMode, setBlastMode] = useState('all'); // 'all' | 'select' | 'paste'
  const [selectedBlastUsers, setSelectedBlastUsers] = useState([]);
  const [pastedEmails, setPastedEmails] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userCategoryFilter, setUserCategoryFilter] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState('medium');
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [bannerDialog, setBannerDialog] = useState(null);
  const [bannerMessage, setBannerMessage] = useState('');
  const [editPartnerDialog, setEditPartnerDialog] = useState(null);
  const [manualReviewMode, setManualReviewMode] = useState(false);
  const [manualReviews, setManualReviews] = useState([{ name: '', rating: 5, comment: '' }]);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/login'); return; }
      const user = await base44.auth.me();
      if (user.role !== 'admin') { navigate('/'); return; }
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const loadData = async () => {
    const [allPartners, allFlags, allPayments, allAnnouncements] = await Promise.all([
      base44.entities.Partner.list('-created_date', 200),
      base44.entities.Flag.list('-created_date', 200),
      base44.entities.Payment.list('-created_date', 200),
      base44.entities.Announcement.list('-created_date', 50),
    ]);
    setPartners(allPartners);
    setFlags(allFlags);
    setPayments(allPayments);
    setAnnouncements(allAnnouncements);
  };

  const handleApprove = async (partner) => {
    setActionLoading(true);
    await base44.entities.Partner.update(partner.id, { status: 'approved' });
    setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, status: 'approved' } : p));
    toast.success(`${partner.name} approved!`);
    setActionLoading(false);
  };

  const handleRevertToPending = async (partner) => {
    setActionLoading(true);
    await base44.entities.Partner.update(partner.id, { status: 'pending', restriction_reason: '' });
    setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, status: 'pending', restriction_reason: '' } : p));
    toast.success(`${partner.name} reverted to pending.`);
    setActionLoading(false);
  };

  const handleRestrict = async () => {
    if (!restrictDialog) return;
    setActionLoading(true);
    if (restrictDialog.ids) {
      await base44.entities.Partner.bulkUpdate(
        restrictDialog.ids.map(id => ({ id, status: 'restricted', restriction_reason: restrictReason }))
      );
      setPartners(prev => prev.map(p => restrictDialog.ids.includes(p.id) ? { ...p, status: 'restricted', restriction_reason: restrictReason } : p));
      toast.success(`${restrictDialog.ids.length} partner${restrictDialog.ids.length !== 1 ? 's' : ''} restricted.`);
    } else {
      await base44.entities.Partner.update(restrictDialog.id, {
        status: 'restricted',
        restriction_reason: restrictReason,
      });
      setPartners(prev => prev.map(p => p.id === restrictDialog.id ? { ...p, status: 'restricted', restriction_reason: restrictReason } : p));
      toast.success(`${restrictDialog.name} has been restricted.`);
    }
    setRestrictDialog(null);
    setRestrictReason('');
    setActionLoading(false);
  };

  const handleBulkApprove = async (ids) => {
    if (ids.length === 0) return;
    setActionLoading(true);
    await base44.entities.Partner.bulkUpdate(ids.map(id => ({ id, status: 'approved' })));
    setPartners(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: 'approved' } : p));
    toast.success(`${ids.length} partner${ids.length !== 1 ? 's' : ''} approved!`);
    setActionLoading(false);
  };

  const handleBulkRestrict = (ids) => {
    if (ids.length === 0) return;
    const names = partners.filter(p => ids.includes(p.id)).map(p => p.name).join(', ');
    setRestrictDialog({ ids, names });
  };

  const handleBulkMarkDomain = async (ids) => {
    if (ids.length === 0) return;
    setActionLoading(true);
    await base44.entities.Partner.bulkUpdate(ids.map(id => ({ id, domain_purchased: true })));
    setPartners(prev => prev.map(p => ids.includes(p.id) ? { ...p, domain_purchased: true } : p));
    toast.success(`${ids.length} partner${ids.length !== 1 ? 's' : ''} marked as domain-purchased!`);
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
    { name: 'Toyin A.', rating: 5, comment: 'Highly skilled and dedicated. The store redesign brought in more customers within days.' },
    { name: 'Marcus J.', rating: 5, comment: 'I was impressed by the level of expertise and attention to my brand needs. Top-tier work.' },
    { name: 'Priya K.', rating: 5, comment: 'Seamless experience from start to finish. My store now converts much better than before.' },
    { name: 'Ahmed L.', rating: 4, comment: 'Very thorough and detail-oriented. Got exactly what I was looking for on this project.' },
    { name: 'Oluwaseun B.', rating: 5, comment: 'Delivered a stunning store. The checkout flow is now smooth and customers love it.' },
    { name: 'Rachel T.', rating: 5, comment: 'Knowledgeable, patient, and incredibly easy to work with. Results speak for themselves.' },
    { name: 'Victor M.', rating: 5, comment: 'Our sales improved significantly after the store optimization. Truly worth every penny.' },
    { name: 'Adaeze C.', rating: 5, comment: 'Very professional approach and creative solutions. The new design exceeded our goals.' },
    { name: 'Samuel D.', rating: 4, comment: 'Good understanding of eCommerce best practices. Project was delivered cleanly and on time.' },
    { name: 'Ifeoma G.', rating: 5, comment: 'Brought fresh ideas that elevated the store. Our bounce rate dropped significantly.' },
    { name: 'Patrick H.', rating: 5, comment: 'Exceptional Shopify knowledge. Solved complex problems quickly and professionally.' },
    { name: 'Zainab F.', rating: 5, comment: 'I am so happy with the final result. The store looks premium and performs excellently.' },
    { name: 'Daniel I.', rating: 5, comment: 'The level of detail and care put into this project was outstanding. Highly recommend!' },
    { name: 'Nkechi O.', rating: 5, comment: 'Transformed our underperforming store into a revenue machine. Absolutely brilliant work.' },
    { name: 'Tom W.', rating: 4, comment: 'Good communicator and skilled developer. Happy with the outcome overall.' },
    { name: 'Chidinma E.', rating: 5, comment: 'Incredible results! Our Shopify store is now fast, clean, and optimized for sales.' },
    { name: 'Ben A.', rating: 5, comment: 'Took the time to understand our brand before making any changes. Perfect execution.' },
    { name: 'Funke S.', rating: 5, comment: 'One of the most capable eCommerce experts I have worked with. Truly impressive work.' },
    { name: 'George N.', rating: 5, comment: 'Every recommendation was on point. Store performance improved greatly after the project.' },
    { name: 'Amara T.', rating: 5, comment: 'Went above and beyond to make sure everything was perfect. Highly professional service.' },
    { name: 'Liam C.', rating: 4, comment: 'Very competent Shopify specialist. Delivered solid results and was easy to collaborate with.' },
    { name: 'Yemi B.', rating: 5, comment: 'Our revenue grew after the store revamp. I credit this partner entirely for that success.' },
    { name: 'Sofia R.', rating: 5, comment: 'Fantastic experience! Clean design, fast load time, and great customer journey.' },
    { name: 'Emeka O.', rating: 5, comment: 'Smart, skilled, and incredibly professional. The store looks and performs beautifully now.' },
    { name: 'Hannah K.', rating: 5, comment: 'Prompt responses and flawless execution. One of the best partners I have ever worked with.' },
    { name: 'Chukwuemeka A.', rating: 5, comment: 'Turned our vision into reality with precision. The finished store exceeded all expectations.' },
    { name: 'Lucy M.', rating: 4, comment: 'Thorough and reliable. The project was completed neatly and delivered on schedule.' },
    { name: 'Bola F.', rating: 5, comment: 'An absolute expert in Shopify. The results were transformative and immediate.' },
    { name: 'Owen D.', rating: 5, comment: 'Took charge of our store and made it world-class. I am thrilled with the outcome.' },
    { name: 'Taiwo A.', rating: 5, comment: 'Brilliant work from start to finish. Sales doubled within a month of the launch.' },
    { name: 'Nina P.', rating: 5, comment: 'Strategic, creative, and results-driven. Exactly the kind of partner every brand needs.' },
  ];

  const handleGenerateReviews = async (partner, count) => {
    const n = Math.min(Math.max(parseInt(count) || 10, 1), reviewPool.length);
    setGeneratingReviews(partner.id);
    // Shuffle pool randomly so each profile gets different reviews
    const shuffled = [...reviewPool].sort(() => Math.random() - 0.5);
    const templates = shuffled.slice(0, n);
    for (const r of templates) {
      await base44.entities.Review.create({ partner_id: partner.id, reviewer_name: r.name, rating: r.rating, comment: r.comment, is_purchased: true });
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

  const handleAddManualReview = async (partner) => {
    const valid = manualReviews.filter(r => r.name.trim() && r.comment.trim());
    if (valid.length === 0) return;
    setGeneratingReviews(partner.id);
    for (const r of valid) {
      await base44.entities.Review.create({
        partner_id: partner.id,
        reviewer_name: r.name.trim(),
        rating: r.rating,
        comment: r.comment.trim(),
        is_purchased: true,
      });
    }
    try { await base44.functions.invoke('updatePartnerRating', { partner_id: partner.id }); } catch (_) {}
    toast.success(`${valid.length} review${valid.length > 1 ? 's' : ''} added for ${partner.name}!`);
    setReviewCountDialog(null);
    setManualReviewMode(false);
    setManualReviews([{ name: '', rating: 5, comment: '' }]);
    loadData();
    setGeneratingReviews(null);
  };

  const handleToggleVerify = async (partner) => {
    const newVal = !partner.is_verified;
    await base44.entities.Partner.update(partner.id, { is_verified: newVal });
    toast.success(newVal ? `${partner.name} verified!` : `Verification removed from ${partner.name}`);
    loadData();
  };

  const handleToggleHide = async (partner) => {
    const newVal = !partner.is_hidden;
    await base44.entities.Partner.update(partner.id, { is_hidden: newVal });
    setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, is_hidden: newVal } : p));
    toast.success(newVal ? `${partner.name} hidden from directory` : `${partner.name} is now visible in directory`);
  };

  const handleDeletePartner = async (partner) => {
    if (!confirm(`Are you sure you want to permanently delete "${partner.name}"? This action cannot be undone.`)) return;
    await base44.entities.Partner.delete(partner.id);
    setPartners(prev => prev.filter(p => p.id !== partner.id));
    toast.success(`${partner.name} has been permanently deleted`);
  };

  const handleToggleUnlimitedReviews = async (partner) => {
    const newVal = !partner.unlimited_reviews;
    await base44.entities.Partner.update(partner.id, { unlimited_reviews: newVal });
    toast.success(newVal ? `${partner.name} approved for unlimited reviews!` : `Unlimited reviews revoked for ${partner.name}`);
    loadData();
  };

  const handleToggleDomain = async (partner) => {
    const newVal = !partner.domain_purchased;
    await base44.entities.Partner.update(partner.id, { domain_purchased: newVal });
    setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, domain_purchased: newVal } : p));
    toast.success(newVal ? `${partner.name} marked as domain-purchased` : `Domain mark removed for ${partner.name}`);
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
    // Remove any reviews that were auto-added for this payment and recompute the rating.
    try {
      await base44.functions.invoke('rollbackPaymentReviews', { id: payment.id, partner_id: payment.partner_id });
    } catch (err) {
      console.error('Failed to roll back reviews:', err);
    }
    toast.success('Payment rejected & linked reviews removed.');
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

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    setCreatingAnnouncement(true);
    await base44.entities.Announcement.create({
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      priority: announcementPriority,
      is_active: true,
    });
    toast.success('Announcement created!');
    setAnnouncementDialog(false);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setAnnouncementPriority('medium');
    loadData();
    setCreatingAnnouncement(false);
  };

  const handleSetBanner = async () => {
    if (!bannerDialog) return;
    const trimmed = bannerMessage.trim();
    await base44.entities.Partner.update(bannerDialog.id, { admin_banner: trimmed || null });
    if (trimmed && bannerDialog.email) {
      try {
        await base44.functions.invoke('sendBannerNotification', {
          partnerEmail: bannerDialog.email,
          partnerName: bannerDialog.name,
          message: trimmed,
        });
      } catch (err) {
        console.error('Failed to send banner email:', err);
      }
    }
    toast.success(trimmed ? `Banner set & email sent to ${bannerDialog.name}` : `Banner cleared for ${bannerDialog.name}`);
    setBannerDialog(null);
    setBannerMessage('');
    loadData();
  };

  const handleToggleAnnouncement = async (announcement) => {
    await base44.entities.Announcement.update(announcement.id, { is_active: !announcement.is_active });
    toast.success(!announcement.is_active ? 'Announcement activated!' : 'Announcement deactivated');
    loadData();
  };

  const handleDeleteAnnouncement = async (announcement) => {
    await base44.entities.Announcement.delete(announcement.id);
    toast.success('Announcement deleted');
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

  const domainPaidIds = new Set(
    payments
      .filter(p => p.status !== 'rejected' && (p.description || '').includes('Domain Purchase'))
      .map(p => p.partner_id)
      .filter(Boolean)
  );
  partners.forEach(p => { if (p.domain_purchased) domainPaidIds.add(p.id); });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage partner accounts, approvals, and flags</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 col-span-2 md:col-span-1">
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
        <TabsList className="mb-6 w-full flex overflow-x-auto sm:flex-wrap justify-start sm:justify-center">
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
          <TabsTrigger value="announcements">
            <Megaphone className="w-4 h-4 mr-1.5" />
            Announcements <Badge variant="secondary" className="ml-1.5">{announcements.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="broadcast">
            <Send className="w-4 h-4 mr-1.5" />
            Broadcast Update
          </TabsTrigger>
          <TabsTrigger value="ads">
            <Megaphone className="w-4 h-4 mr-1.5" />
            Ad Promos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PartnerList partners={pending} onApprove={handleApprove} onRestrict={setRestrictDialog} onBulkApprove={handleBulkApprove} onBulkRestrict={handleBulkRestrict} onBulkMarkDomain={handleBulkMarkDomain} domainPaidPartnerIds={domainPaidIds} showApprove onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} onEditDetails={setEditPartnerDialog} onGenerateReviews={(p) => { setReviewCountDialog(p); setReviewCount('10'); }} generatingReviews={generatingReviews} onToggleVerify={handleToggleVerify} onToggleUnlimitedReviews={handleToggleUnlimitedReviews} onToggleDomain={handleToggleDomain} onSetBanner={(p) => { setBannerDialog(p); setBannerMessage(p.admin_banner || ''); }} onToggleHide={handleToggleHide} onDelete={handleDeletePartner} />
        </TabsContent>
        <TabsContent value="approved">
          <PartnerList partners={approved} onRestrict={setRestrictDialog} onRevert={handleRevertToPending} onBulkApprove={handleBulkApprove} onBulkRestrict={handleBulkRestrict} onBulkMarkDomain={handleBulkMarkDomain} domainPaidPartnerIds={domainPaidIds} showApprove={false} onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} onEditDetails={setEditPartnerDialog} onGenerateReviews={(p) => { setReviewCountDialog(p); setReviewCount('10'); }} generatingReviews={generatingReviews} onToggleVerify={handleToggleVerify} onToggleUnlimitedReviews={handleToggleUnlimitedReviews} onToggleDomain={handleToggleDomain} onSetBanner={(p) => { setBannerDialog(p); setBannerMessage(p.admin_banner || ''); }} onToggleHide={handleToggleHide} onDelete={handleDeletePartner} />
        </TabsContent>
        <TabsContent value="restricted">
          <PartnerList partners={restricted} onApprove={handleApprove} onRestrict={setRestrictDialog} onBulkApprove={handleBulkApprove} onBulkRestrict={handleBulkRestrict} onBulkMarkDomain={handleBulkMarkDomain} domainPaidPartnerIds={domainPaidIds} showApprove onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} onEditDetails={setEditPartnerDialog} onGenerateReviews={(p) => { setReviewCountDialog(p); setReviewCount('10'); }} generatingReviews={generatingReviews} onToggleVerify={handleToggleVerify} onToggleUnlimitedReviews={handleToggleUnlimitedReviews} onToggleDomain={handleToggleDomain} onSetBanner={(p) => { setBannerDialog(p); setBannerMessage(p.admin_banner || ''); }} onToggleHide={handleToggleHide} onDelete={handleDeletePartner} />
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
                setAnalyticsData(res.data.data);
              } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to load analytics');
              }
              setAnalyticsLoading(false);
            }}
          />
        </TabsContent>
        <TabsContent value="ads">
          <AdsSection />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsSection
            announcements={announcements}
            onOpenDialog={() => setAnnouncementDialog(true)}
            onToggle={handleToggleAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        </TabsContent>
        <TabsContent value="broadcast">
          <BroadcastUpdateSection />
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
      <Dialog open={!!reviewCountDialog} onOpenChange={() => { setReviewCountDialog(null); setReviewCount('10'); setManualReviewMode(false); setManualReviews([{ name: '', rating: 5, comment: '' }]); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Reviews — {reviewCountDialog?.name}</DialogTitle>
          </DialogHeader>

          {/* Tab toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
            <button
              className={`flex-1 py-2 transition-colors ${!manualReviewMode ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted'}`}
              onClick={() => setManualReviewMode(false)}
            >
              Auto-Generate
            </button>
            <button
              className={`flex-1 py-2 transition-colors ${manualReviewMode ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted'}`}
              onClick={() => setManualReviewMode(true)}
            >
              Paste / Manual
            </button>
          </div>

          {!manualReviewMode ? (
            <>
              <p className="text-sm text-muted-foreground">
                How many reviews to auto-generate for <strong>{reviewCountDialog?.name}</strong>? (max 20)
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
            </>
          ) : (
            <>
              <div className="max-h-[55vh] overflow-y-auto space-y-4 pr-1">
                {manualReviews.map((r, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-3 space-y-2 bg-muted/30 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Review #{idx + 1}</span>
                      {manualReviews.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setManualReviews(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Reviewer name *"
                      value={r.name}
                      onChange={e => setManualReviews(prev => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                    />
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => setManualReviews(prev => prev.map((x, i) => i === idx ? { ...x, rating: n } : x))}>
                          <Star className={`w-6 h-6 transition-colors ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Review comment *"
                      value={r.comment}
                      onChange={e => setManualReviews(prev => prev.map((x, i) => i === idx ? { ...x, comment: e.target.value } : x))}
                      className="h-20 resize-none"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setManualReviews(prev => [...prev, { name: '', rating: 5, comment: '' }])}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-primary border border-dashed border-primary/40 rounded-lg py-2 hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Another Review
                </button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setReviewCountDialog(null); setManualReviewMode(false); setManualReviews([{ name: '', rating: 5, comment: '' }]); }}>Cancel</Button>
                <Button
                  onClick={() => handleAddManualReview(reviewCountDialog)}
                  disabled={manualReviews.filter(r => r.name.trim() && r.comment.trim()).length === 0 || generatingReviews === reviewCountDialog?.id}
                >
                  {generatingReviews === reviewCountDialog?.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Star className="w-4 h-4 mr-1.5" /> Add {manualReviews.filter(r => r.name.trim() && r.comment.trim()).length || ''} Review{manualReviews.filter(r => r.name.trim() && r.comment.trim()).length !== 1 ? 's' : ''}</>
                  }
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Blast Dialog */}
      <Dialog open={emailBlastDialog} onOpenChange={(open) => {
        setEmailBlastDialog(open);
        if (!open) { setBlastSubject(''); setBlastBody(''); setBlastMode('all'); setSelectedBlastUsers([]); setPastedEmails(''); setUserSearch(''); setUserCategoryFilter('all'); setBlastSenderName(''); }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Email Blast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Mode selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Recipients</label>
              <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
                {[['all', 'All Users'], ['select', 'Select Users'], ['paste', 'Paste Emails']].map(([val, label]) => (
                  <button
                    key={val}
                    className={`flex-1 py-2 transition-colors ${blastMode === val ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted'}`}
                    onClick={() => setBlastMode(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select users mode */}
            {blastMode === 'select' && (
              <div className="space-y-2">
                {/* Category filter chips */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'badge', label: '✅ With Badge' },
                    { key: 'banner', label: '🔔 With Banner' },
                    { key: 'pending', label: '⏳ Pending' },
                  ].map(({ key, label }) => {
                    const active = (userCategoryFilter || 'all') === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setUserCategoryFilter(key)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="mb-1"
                />
                <div className="border border-border rounded-xl divide-y divide-border max-h-48 overflow-y-auto">
                  {partners
                    .filter(p => {
                      const q = userSearch.toLowerCase();
                      const matchesSearch = !q || p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
                      const cat = userCategoryFilter || 'all';
                      const matchesCat =
                        cat === 'all' ? true :
                        cat === 'badge' ? !!p.is_verified :
                        cat === 'banner' ? !!p.admin_banner :
                        cat === 'pending' ? p.status === 'pending' : true;
                      return matchesSearch && matchesCat;
                    })
                    .map(p => (
                      <label key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/40">
                        <input
                          type="checkbox"
                          checked={selectedBlastUsers.includes(p.email)}
                          onChange={() => {
                            if (!p.email) return;
                            setSelectedBlastUsers(prev =>
                              prev.includes(p.email) ? prev.filter(e => e !== p.email) : [...prev, p.email]
                            );
                          }}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            {p.is_verified && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5">Badge</span>}
                            {p.admin_banner && <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-1.5 py-0.5">Banner</span>}
                            {p.status === 'pending' && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5">Pending</span>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{p.email || 'No email'}</p>
                        </div>
                      </label>
                    ))}
                </div>
                {selectedBlastUsers.length > 0 && (
                  <p className="text-xs text-muted-foreground">{selectedBlastUsers.length} recipient{selectedBlastUsers.length !== 1 ? 's' : ''} selected</p>
                )}
              </div>
            )}

            {/* Paste emails mode */}
            {blastMode === 'paste' && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste emails here — one per line, or comma/space separated&#10;e.g.&#10;john@example.com&#10;jane@example.com, bob@example.com"
                  value={pastedEmails}
                  onChange={e => setPastedEmails(e.target.value)}
                  className="h-32 resize-none font-mono text-sm"
                />
                {(() => {
                  const parsed = pastedEmails.split(/[\n,\s]+/).map(e => e.trim()).filter(e => e.includes('@'));
                  return parsed.length > 0 ? (
                    <p className="text-xs text-muted-foreground">{parsed.length} valid email{parsed.length !== 1 ? 's' : ''} detected</p>
                  ) : null;
                })()}
              </div>
            )}

            {blastMode === 'all' && (
              <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                This will send to all registered users in the app.
              </p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Sender Name</label>
              <Input placeholder="e.g. Shopify Partners Directory" value={blastSenderName} onChange={e => setBlastSenderName(e.target.value)} />
              <p className="text-xs text-muted-foreground">Emails are sent from the app's built-in sender address. Only the sender name above is customizable.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input placeholder="e.g. Important Platform Update" value={blastSubject} onChange={e => setBlastSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea placeholder="Write your message here..." value={blastBody} onChange={e => setBlastBody(e.target.value)} className="h-40 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEmailBlastDialog(false); }}>Cancel</Button>
            <Button
              onClick={async () => {
                setSendingBlast(true);
                try {
                  let recipients = undefined;
                  if (blastMode === 'select') {
                    recipients = selectedBlastUsers;
                  } else if (blastMode === 'paste') {
                    recipients = pastedEmails.split(/[\n,\s]+/).map(e => e.trim()).filter(e => e.includes('@'));
                  }
                  const res = await base44.functions.invoke('sendEmailBlast', { subject: blastSubject, body: blastBody, recipients, senderName: blastSenderName });
                  toast.success(res.data.message || 'Email blast sent successfully!');
                  setEmailBlastDialog(false);
                } catch (err) {
                  toast.error(err.response?.data?.error || 'Failed to send email blast');
                }
                setSendingBlast(false);
              }}
              disabled={
                !blastSubject.trim() || !blastBody.trim() || sendingBlast ||
                (blastMode === 'select' && selectedBlastUsers.length === 0) ||
                (blastMode === 'paste' && pastedEmails.split(/[\n,\s]+/).filter(e => e.includes('@')).length === 0)
              }
            >
              {sendingBlast ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <><Send className="w-4 h-4 mr-1.5" /> Send Email Blast</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g. Platform Maintenance Scheduled"
                value={announcementTitle}
                onChange={e => setAnnouncementTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                placeholder="Write your announcement..."
                value={announcementContent}
                onChange={e => setAnnouncementContent(e.target.value)}
                className="h-32 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={announcementPriority} onValueChange={setAnnouncementPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAnnouncementDialog(false); setAnnouncementTitle(''); setAnnouncementContent(''); setAnnouncementPriority('medium'); }}>Cancel</Button>
            <Button onClick={handleCreateAnnouncement} disabled={!announcementTitle.trim() || !announcementContent.trim() || creatingAnnouncement}>
              {creatingAnnouncement ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <><Megaphone className="w-4 h-4 mr-1.5" /> Create Announcement</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={!!bannerDialog} onOpenChange={() => { setBannerDialog(null); setBannerMessage(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Admin Banner for {bannerDialog?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This message will appear as a banner on the partner's profile page. Leave empty to clear any existing banner.
          </p>
          <Textarea
            placeholder="e.g. Your account is under review. Please update your profile information."
            value={bannerMessage}
            onChange={e => setBannerMessage(e.target.value)}
            className="h-28 resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBannerDialog(null); setBannerMessage(''); }}>Cancel</Button>
            {bannerDialog?.admin_banner && (
              <Button variant="ghost" className="text-red-600" onClick={() => { setBannerMessage(''); }} >
                Clear Banner
              </Button>
            )}
            <Button onClick={handleSetBanner}>
              <Bell className="w-4 h-4 mr-1.5" /> {bannerMessage.trim() ? 'Set Banner' : 'Clear Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Details Dialog */}
      <EditPartnerDialog
        partner={editPartnerDialog}
        open={!!editPartnerDialog}
        onClose={() => setEditPartnerDialog(null)}
        onSaved={loadData}
      />

      {/* Restrict Dialog */}
      <Dialog open={!!restrictDialog} onOpenChange={() => { setRestrictDialog(null); setRestrictReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restrict {restrictDialog?.ids ? `${restrictDialog.ids.length} Accounts` : 'Account'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Restricting <strong>{restrictDialog?.ids ? restrictDialog.names : restrictDialog?.name}</strong> will hide {restrictDialog?.ids ? 'them' : 'them'} from the directory. Please provide a reason.
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
          {pay.status === 'approved' && (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full text-red-700 border-red-200 hover:bg-red-50" onClick={() => onReject(pay)}>
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject & Remove Reviews
              </Button>
            </div>
          )}
        </div>
      ))}
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
              Send important updates and announcements to all registered users directly from the app.
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
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No visitor data available yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Make sure your Google Analytics is tracking partner page views.</p>
      </div>
    );
  }

  const maxReviews = Math.max(...analyticsData.map(p => p.total_users || 0), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Partner Activity Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">Profile clicks per approved partner</p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="bg-white border border-border rounded-xl divide-y divide-border">
        {[...analyticsData]
          .sort((a, b) => (b.total_users || 0) - (a.total_users || 0))
          .map((partner, index) => {
            const reviews = partner.total_users || 0;
            const pct = Math.round((reviews / maxReviews) * 100);
            return (
              <div key={partner.partner_id} className="px-4 py-3 flex items-center gap-4">
                <span className="w-5 text-xs text-muted-foreground font-mono shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{partner.partner_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{reviews.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">★ {partner.rating?.toFixed(1) || '—'}</p>
                    <p className="text-xs text-muted-foreground">rating</p>
                  </div>
                </div>
              </div>
            );
          })}
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
    { key: 'reviews_5', label: '5 Reviews Package', prefix: '₦', suffix: 'NGN' },
    { key: 'reviews_10', label: '10 Reviews Package', prefix: '₦', suffix: 'NGN' },
    { key: 'reviews_20', label: '20 Reviews Package', prefix: '₦', suffix: 'NGN' },
    { key: 'domain_purchase', label: 'Domain Purchase', prefix: '₦', suffix: 'NGN' },
  ];

  const bankFields = [
    { key: 'bank_account_name', label: 'Bank Account Name' },
    { key: 'bank_account_number', label: 'Bank Account Number' },
    { key: 'bank_name', label: 'Bank Name' },
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
      </div>
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <p className="font-semibold flex items-center gap-1.5 text-sm"><Landmark className="w-4 h-4" /> Payment Bank Details</p>
        <p className="text-xs text-muted-foreground -mt-2">Shown to partners in the Buy Domain payment modal.</p>
        {bankFields.map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm font-medium">{f.label}</label>
            <Input
              value={prices[f.key] ?? ''}
              onChange={e => setPrices(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full"
            />
          </div>
        ))}
        <Button className="w-full mt-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings'}
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