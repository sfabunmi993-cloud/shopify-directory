import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PackageCheck, ExternalLink, Paperclip, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const STATUS_COLORS = {
  delivered: 'bg-primary/10 text-primary',
  completed: 'bg-emerald-50 text-emerald-700',
  disputed: 'bg-red-50 text-red-600',
};

export default function ProjectsSection({ partnerId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) return;
    base44.entities.Project.filter({ partner_id: partnerId }, '-created_date', 50)
      .then(setProjects)
      .finally(() => setLoading(false));
  }, [partnerId]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  if (projects.length === 0) return (
    <div className="py-8 text-center text-sm text-muted-foreground">
      <PackageCheck className="w-8 h-8 opacity-20 mx-auto mb-2" />
      No delivered projects yet. Deliver your first project from the Messages page.
    </div>
  );

  return (
    <div className="space-y-3">
      {projects.map(p => (
        <div key={p.id} className="border border-border rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm text-foreground">{p.title}</p>
            <Badge className={`text-xs shrink-0 ${STATUS_COLORS[p.status] || STATUS_COLORS.delivered}`}>{p.status}</Badge>
          </div>
          {p.client_name && <p className="text-xs text-muted-foreground mb-1">Client: {p.client_name}</p>}
          {p.description && <p className="text-xs text-muted-foreground leading-relaxed mb-2">{p.description}</p>}
          <div className="flex flex-wrap gap-2 mt-1">
            {p.delivery_url && (
              <a href={p.delivery_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> View delivery
              </a>
            )}
            {p.delivery_file_url && (
              <a href={p.delivery_file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Paperclip className="w-3.5 h-3.5" /> Attachment
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">{p.created_date ? format(new Date(p.created_date), 'MMM d, yyyy') : ''}</p>
        </div>
      ))}
    </div>
  );
}