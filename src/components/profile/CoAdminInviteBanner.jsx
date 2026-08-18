import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CoAdminInviteBanner() {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        const pending = await base44.entities.CoAdminInvite.filter({ user_id: me.id, status: 'pending' });
        if (pending.length > 0) {
          // Show the most recent pending invite
          setInvite(pending.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]);
        }
      } catch (err) {
        // ignore — non-partners or unauthed users just see nothing
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAccept = async () => {
    if (!invite) return;
    setActing(true);
    try {
      await base44.functions.invoke('acceptCoAdminInvite', { invite_id: invite.id });
      toast.success('You are now a co-admin! Reloading…');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to accept invite.');
      setActing(false);
    }
  };

  const handleDecline = async () => {
    if (!invite) return;
    setActing(true);
    try {
      await base44.entities.CoAdminInvite.update(invite.id, { status: 'declined' });
      toast.success('Invitation declined.');
      setInvite(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to decline invite.');
    } finally {
      setActing(false);
    }
  };

  if (loading || !invite) return null;

  return (
    <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-indigo-900">Co-admin invitation</p>
        <p className="text-indigo-700 mt-0.5">
          {invite.invited_by_name ? `${invite.invited_by_name} has ` : 'You have been '}invited you to become a co-admin. Co-admins gain full access to the Admin Dashboard to help manage the platform.
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 rounded-full gap-1"
          onClick={handleAccept}
          disabled={acting}
        >
          {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          onClick={handleDecline}
          disabled={acting}
        >
          <X className="w-3.5 h-3.5" />
          Decline
        </Button>
      </div>
    </div>
  );
}