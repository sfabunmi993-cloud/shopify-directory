import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

export default function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const active = await base44.entities.Announcement.filter({ is_active: true }, '-created_date', 10);
        setAnnouncements(active);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  if (loading || announcements.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          Latest Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-primary/10"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-semibold text-sm text-foreground">{announcement.title}</h4>
                  <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[announcement.priority]}`}>
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{announcement.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {announcement.created_date ? format(new Date(announcement.created_date), 'MMM d, yyyy') : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}