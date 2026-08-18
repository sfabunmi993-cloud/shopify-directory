import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Mail, CreditCard, ShieldCheck, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CO_ADMIN_ROLES = [
  {
    value: 'payment_notifications',
    label: 'Payment Notifications',
    icon: CreditCard,
    description: 'Can view the Payments tab and receives payment notification emails. No partner management.',
    tabs: ['payments'],
  },
  {
    value: 'partners_moderator',
    label: 'Partners Moderator',
    icon: ShieldCheck,
    description: 'Can manage partners (pending, approved, restricted), payments, and flags.',
    tabs: ['pending', 'approved', 'restricted', 'payments', 'flags'],
  },
  {
    value: 'marketing_admin',
    label: 'Marketing Admin',
    icon: Megaphone,
    description: 'Partners Moderator plus Email Blast, Announcements, Broadcast Update, and Ad Promos.',
    tabs: ['pending', 'approved', 'restricted', 'payments', 'flags', 'email-blast', 'announcements', 'broadcast', 'ads'],
  },
  {
    value: 'full_admin',
    label: 'Full Admin',
    icon: Mail,
    description: 'Full access to everything, including Pricing settings.',
    tabs: ['pending', 'approved', 'restricted', 'payments', 'flags', 'pricing', 'email-blast', 'announcements', 'broadcast', 'ads'],
  },
];

export function getAccessibleTabs(user) {
  if (!user || user.role !== 'admin') return [];
  // The original platform admin has no co_admin_role → full access
  if (!user.co_admin_role || user.co_admin_role === 'full_admin') {
    return CO_ADMIN_ROLES[CO_ADMIN_ROLES.length - 1].tabs;
  }
  const role = CO_ADMIN_ROLES.find(r => r.value === user.co_admin_role);
  return role ? role.tabs : [];
}

export default function CoAdminRoleDialog({ open, partner, onClose, onConfirm, sending }) {
  const [selected, setSelected] = useState('full_admin');

  // Reset to default when opened for a new partner
  React.useEffect(() => {
    if (open) setSelected('full_admin');
  }, [open, partner?.id]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Select co-admin role
          </DialogTitle>
          <DialogDescription>
            Choose what {partner?.name || 'this partner'} will be able to do once they accept the co-admin invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {CO_ADMIN_ROLES.map((role) => {
            const Icon = role.icon;
            const active = selected === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelected(role.value)}
                className={cn(
                  'w-full text-left rounded-xl border p-3 transition-colors flex items-start gap-3',
                  active
                    ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-200'
                    : 'border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/40'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  active ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {role.label}
                    {active && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{role.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 rounded-full gap-1.5"
            onClick={() => onConfirm(selected)}
            disabled={sending}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}