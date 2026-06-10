import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Clock, CheckCircle, Send, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PartnerAvatar from '@/components/directory/PartnerAvatar';

function statusBadge(type) {
  if (type === 'hire_request') return <Badge className="bg-primary/10 text-primary border-0 text-xs">Hire Request</Badge>;
  if (type === 'inquiry') return <Badge className="bg-blue-50 text-blue-600 border-0 text-xs">Inquiry</Badge>;
  return <Badge variant="secondary" className="text-xs">Reply</Badge>;
}

export default function InquiriesDashboard({ userId }) {
  const [threads, setThreads] = useState([]);
  const [partners, setPartners] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const msgs = await base44.entities.Message.filter({ sender_id: userId });
      // Group by conversation_id, keep latest per convo
      const map = {};
      msgs.forEach(m => {
        const key = m.conversation_id || m.id;
        if (!map[key] || new Date(m.created_date) > new Date(map[key].created_date)) {
          map[key] = m;
        }
      });
      const unique = Object.values(map).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setThreads(unique.slice(0, 5));

      // Fetch partner names
      const partnerIds = [...new Set(unique.map(m => m.partner_id).filter(Boolean))];
      const partnerData = {};
      await Promise.all(partnerIds.map(async (pid) => {
        try {
          const res = await base44.entities.Partner.filter({ id: pid });
          if (res.length > 0) partnerData[pid] = res[0];
        } catch {}
      }));
      setPartners(partnerData);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
        No inquiries yet. Start by contacting a partner.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map(msg => {
        const partner = partners[msg.partner_id];
        return (
          <Link
            key={msg.id}
            to="/messages"
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors"
          >
            <div className="shrink-0">
              <PartnerAvatar partner={partner} size="sm" shape="rounded-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold truncate">{partner?.name || 'Partner'}</span>
                {statusBadge(msg.message_type)}
                {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject || msg.body}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </Link>
        );
      })}
      <Link to="/messages" className="block text-center text-xs text-primary font-medium hover:underline pt-1">
        View all messages →
      </Link>
    </div>
  );
}