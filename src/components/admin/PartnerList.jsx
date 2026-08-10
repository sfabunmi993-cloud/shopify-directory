import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Eye, Edit2, BadgeCheck, Star, Infinity as InfinityIcon, Bell, XCircle, CheckCircle, EyeOff, Trash2, Loader2, ShieldAlert, Globe } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  restricted: 'bg-red-50 text-red-700 border-red-200',
};

function getPartnerRank(reviewCount = 0) {
  if (reviewCount >= 150) return { label: 'Premium', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (reviewCount >= 50) return { label: 'Plus', color: 'bg-primary/10 text-primary border-primary/20' };
  return { label: 'Standard', color: 'bg-muted text-muted-foreground border-border' };
}

export default function PartnerList(props) {
  const { partners, onApprove, onRestrict, onBulkApprove, onBulkRestrict, onEditId, onGenerateReviews, generatingReviews, onToggleVerify, onToggleUnlimitedReviews, onSetBanner, showApprove, onToggleHide, onDelete, domainPaidPartnerIds } = props;
  const [selected, setSelected] = useState([]);

  if (partners.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No partners in this category.</p>;
  }

  const allSelected = selected.length === partners.length;
  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelected(allSelected ? [] : partners.map(p => p.id));
  const clearSelection = () => setSelected([]);
  const selectDomainPaid = () => {
    const ids = partners.filter(p => domainPaidPartnerIds?.has(p.id)).map(p => p.id);
    setSelected(ids);
    if (ids.length === 0) toast.info('No domain-paid partners in this list.');
  };

  const handleBulkApprove = () => {
    onBulkApprove?.(selected);
    clearSelection();
  };
  const handleBulkRestrict = () => {
    onBulkRestrict?.(selected);
    clearSelection();
  };

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="sticky top-16 z-10 flex items-center gap-2 flex-wrap bg-primary/5 border border-primary/20 rounded-xl p-3 mb-1">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" className="rounded-full text-emerald-700 border-emerald-200 hover:bg-emerald-50" onClick={handleBulkApprove}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve selected
          </Button>
          <Button size="sm" variant="outline" className="rounded-full text-red-700 border-red-200 hover:bg-red-50" onClick={handleBulkRestrict}>
            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Restrict selected
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full" onClick={clearSelection}>Clear</Button>
        </div>
      )}

      {/* Select all row */}
      <div className="flex items-center gap-3 flex-wrap px-1">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          className="rounded border-border"
        />
        <span className="text-xs text-muted-foreground">
          {selected.length} of {partners.length} selected
        </span>
        <Button size="sm" variant="outline" className="rounded-full h-7 text-xs gap-1" onClick={selectDomainPaid}>
          <Globe className="w-3 h-3" /> Select domain-paid
        </Button>
      </div>

      {partners.map(p => {
        const rank = getPartnerRank(p.review_count);
        const isSelected = selected.includes(p.id);
        return (
          <div key={p.id} className={`bg-white border rounded-xl p-4 transition-colors ${isSelected ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(p.id)}
                className="rounded border-border shrink-0 self-start sm:self-center mt-1 sm:mt-0"
              />
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 self-start sm:self-center">
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
                  {p.is_hidden && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Hidden</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                {p.restriction_reason && (
                  <p className="text-xs text-red-600 mt-1">Reason: {p.restriction_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 [&>*]:shrink-0">
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
                <Button
                  size="sm"
                  variant="outline"
                  className={`rounded-full gap-1 ${p.unlimited_reviews ? 'text-purple-700 border-purple-300 bg-purple-50 hover:bg-purple-100' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  title={p.unlimited_reviews ? 'Revoke unlimited reviews' : 'Approve unlimited reviews'}
                  onClick={() => onToggleUnlimitedReviews(p)}
                >
                  <InfinityIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{p.unlimited_reviews ? 'Unlimited ✓' : 'Unlimited'}</span>
                </Button>
                {showApprove && (
                  <Button size="sm" variant="outline" className="rounded-full text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => onApprove(p)}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className={`rounded-full gap-1 ${p.admin_banner ? 'text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  title={p.admin_banner ? 'Edit admin banner' : 'Set admin banner'}
                  onClick={() => onSetBanner(p)}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{p.admin_banner ? 'Banner ✓' : 'Banner'}</span>
                </Button>
                {p.status !== 'restricted' && (
                  <Button size="sm" variant="outline" className="rounded-full text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => onRestrict(p)}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Restrict
                  </Button>
                )}
              </div>
            </div>
            {/* Extra actions row: Hide/Unhide + Delete */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border mt-3">
              <Button
                size="sm"
                variant="ghost"
                className={`rounded-full gap-1 text-xs ${p.is_hidden ? 'text-amber-600 hover:bg-amber-50' : 'text-muted-foreground hover:bg-slate-50'}`}
                onClick={() => onToggleHide?.(p)}
                title={p.is_hidden ? 'Unhide from directory' : 'Hide from directory'}
              >
                <EyeOff className="w-3 h-3" />
                {p.is_hidden ? 'Unhide' : 'Hide'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full gap-1 text-xs text-red-500 hover:bg-red-50"
                onClick={() => onDelete?.(p)}
                title="Permanently delete this partner"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}