import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Search, ShieldAlert, Users, Flag, Eye, Hash, Edit2 } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [restrictDialog, setRestrictDialog] = useState(null);
  const [restrictReason, setRestrictReason] = useState('');
  const [editIdDialog, setEditIdDialog] = useState(null);
  const [newPartnerId, setNewPartnerId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
    const [allPartners, allFlags] = await Promise.all([
      base44.entities.Partner.list('-created_date', 200),
      base44.entities.Flag.list('-created_date', 200),
    ]);
    setPartners(allPartners);
    setFlags(allFlags);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending <Badge variant="secondary" className="ml-1.5">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved <Badge variant="secondary" className="ml-1.5">{approved.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="restricted">
            Restricted <Badge variant="secondary" className="ml-1.5">{restricted.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="flags">
            Flags <Badge variant="secondary" className="ml-1.5">{pendingFlags.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PartnerList partners={pending} onApprove={handleApprove} onRestrict={setRestrictDialog} onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} showApprove />
        </TabsContent>
        <TabsContent value="approved">
          <PartnerList partners={approved} onRestrict={setRestrictDialog} onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} />
        </TabsContent>
        <TabsContent value="restricted">
          <PartnerList partners={restricted} onApprove={handleApprove} onEditId={(p) => { setEditIdDialog(p); setNewPartnerId(p.partner_number || ''); }} showApprove />
        </TabsContent>
        <TabsContent value="flags">
          <FlagList flags={pendingFlags} partners={partners} onDismiss={handleDismissFlag} onReviewed={handleMarkFlagReviewed} />
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

function PartnerList({ partners, onApprove, onRestrict, onEditId, showApprove }) {
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