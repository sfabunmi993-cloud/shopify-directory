import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  const load = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      if (!me) return;
      setAuthed(true);
      const items = await base44.entities.Notification.filter(
        { user_id: me.id },
        '-created_date',
        20
      );
      setNotifications(items || []);
      setUnread((items || []).filter((n) => !n.is_read).length);
    } catch {
      // not logged in — render nothing
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    let unsub = null;
    try {
      unsub = base44.entities.Notification.subscribe(() => load());
    } catch {
      // realtime subscribe unavailable — polling covers it
    }
    return () => {
      clearInterval(interval);
      if (typeof unsub === 'function') unsub();
    };
  }, [load]);

  const markAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.is_read);
    if (unreadItems.length === 0) return;
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await Promise.all(
      unreadItems.map((n) =>
        base44.entities.Notification.update(n.id, { is_read: true }).catch(() => {})
      )
    );
  };

  const handleOpen = (isOpen) => {
    setOpen(isOpen);
    if (isOpen && unread > 0) markAllRead();
  };

  const handleItemClick = (n) => {
    setOpen(false);
    if (n.action_url) navigate(n.action_url);
  };

  if (!authed) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-accent transition-colors text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center no-select"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 sticky top-0 bg-background z-10">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 no-select"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              className="flex-col items-start gap-1 py-2.5 px-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                <span className="text-sm font-medium flex-1 truncate">{n.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                  {timeAgo(n.created_date)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 w-full">{n.content}</p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}