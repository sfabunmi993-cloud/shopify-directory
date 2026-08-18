import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ShieldCheck, UserCog } from 'lucide-react';
import { CO_ADMIN_ROLES } from '@/components/admin/CoAdminRoleDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ROLE_LABELS = Object.fromEntries(CO_ADMIN_ROLES.map(r => [r.value, r.label]));

export default function UsersSection({ users, coAdminInvites, currentUserId, onRoleChanged }) {
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...users].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    if (!q) return list;
    return list.filter(u =>
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const pendingRoleByUser = useMemo(() =>
    Object.fromEntries(coAdminInvites.filter(i => i.status === 'pending' && i.co_admin_role).map(i => [i.user_id, i.co_admin_role])),
    [coAdminInvites]);

  const handleChangeRole = async (user, newRole) => {
    setSavingId(user.id);
    try {
      await base44.asServiceRole.entities.User.update(user.id, { co_admin_role: newRole });
      if (onRoleChanged) await onRoleChanged();
      toast.success(`Role updated to "${ROLE_LABELS[newRole] || newRole}" for ${user.full_name || user.email}`);
    } catch (err) {
      toast.error('Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" /> App Users
          </h2>
          <p className="text-sm text-muted-foreground">
            View every user of the app and assign a co-admin role to any partner-admin.
          </p>
        </div>
        <Badge variant="secondary">{filtered.length} users</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Co-admin role</th>
                <th className="px-4 py-3 font-medium text-right">Assign role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isPending = !!pendingRoleByUser[u.id];
                const currentRole = u.co_admin_role || (isPending ? pendingRoleByUser[u.id] : null);
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {isSelf && <ShieldCheck className="w-4 h-4 text-primary" />}
                        {u.full_name || 'Unnamed user'}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role || 'user'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {currentRole ? (
                        <span className="text-xs font-medium text-foreground">
                          {ROLE_LABELS[currentRole] || currentRole}
                          {isPending && <span className="text-amber-600"> · invite sent</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role === 'admin' ? (
                        <div className="inline-flex items-center gap-2">
                          {savingId === u.id && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                          <Select
                            value={u.co_admin_role || ''}
                            onValueChange={(v) => handleChangeRole(u, v)}
                            disabled={savingId === u.id || isSelf}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={isSelf ? 'You (cannot edit)' : 'Choose role'} />
                            </SelectTrigger>
                            <SelectContent>
                              {CO_ADMIN_ROLES.map(r => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Partner only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}