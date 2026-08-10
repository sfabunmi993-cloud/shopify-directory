import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, X } from 'lucide-react';

const PRIORITY_STYLES = {
  low: 'bg-slate-50 text-slate-800 border-slate-200',
  medium: 'bg-blue-50 text-blue-800 border-blue-200',
  high: 'bg-orange-50 text-orange-800 border-orange-200',
  urgent: 'bg-red-50 text-red-800 border-red-200',
};

const DISMISS_KEY = 'dismissed_announcements';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]'));
    } catch {
      setDismissed([]);
    }
    base44.entities.Announcement.list('-created_date', 50)
      .then((records) => {
        const active = records.filter((a) => a.is_active);
        if (active.length === 0) {
          setAnnouncement(null);
          return;
        }
        const priorityRank = { urgent: 4, high: 3, medium: 2, low: 1 };
        const top = active.sort(
          (a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
        )[0];
        setAnnouncement(top);
      })
      .catch(() => setAnnouncement(null));
  }, []);

  if (!announcement || dismissed.includes(announcement.id)) return null;

  const handleDismiss = () => {
    const next = [...dismissed, announcement.id];
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  };

  const style = PRIORITY_STYLES[announcement.priority] || PRIORITY_STYLES.medium;

  return (
    <div className={`border-b px-4 py-2.5 ${style}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Megaphone className="w-4 h-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm">{announcement.title}</span>
          {announcement.content && (
            <span className="text-sm ml-2 opacity-90">{announcement.content}</span>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-black/10 transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}