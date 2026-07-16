import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Loader2, MessageSquare } from 'lucide-react';

export default function NewDirectMessageModal({ isOpen, onClose, currentUser, onStart }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const loadUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await base44.entities.User.list(100);
        const filtered = allUsers.filter((u) => u.id !== currentUser?.id);
        setUsers(filtered);
      } catch (err) {
        console.error('Failed to load users', err);
      }
      setLoading(false);
    };
    loadUsers();
  }, [isOpen, currentUser]);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const initials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Start a Private Conversation</DialogTitle>
        </DialogHeader>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 rounded-full border-0 outline-none placeholder:text-muted-foreground focus:bg-muted"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => onStart(u)}
                className="w-full text-left flex items-center gap-3 p-2.5 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {initials(u.full_name || u.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{u.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}