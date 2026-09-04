import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, DollarSign, Globe, Briefcase, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { partnerProfilePath } from '@/lib/partnerUrl';

const CATEGORY_LABELS = {
  marketing_and_sales: 'Marketing & Sales',
  store_setup_and_management: 'Store Setup',
  development_and_troubleshooting: 'Development',
  visual_content_and_branding: 'Visual Content',
  content_writing: 'Content Writing',
  expert_guidance: 'Expert Guidance',
};

const TIER_STYLES = {
  standard: 'bg-muted text-muted-foreground',
  plus: 'bg-primary/10 text-primary',
  premium: 'bg-amber-50 text-amber-700 border-amber-200',
};

function Row({ label, children }) {
  return (
    <div className="contents">
      <div className="py-3 px-4 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center border-b border-border">
        {label}
      </div>
      {children}
    </div>
  );
}

export default function ComparePartners({ partners, onRemove, onClose }) {
  if (!partners || partners.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Select at least 2 partners from the directory to compare.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/directory"><ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory</Link>
        </Button>
      </div>
    );
  }

  const cols = partners.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
        </Button>
        <h1 className="font-heading text-xl font-bold">Compare Partners</h1>
        <span className="text-sm text-muted-foreground">({partners.length} selected)</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        {/* Header row */}
        <div className={`grid border-b border-border`} style={{ gridTemplateColumns: `180px repeat(${cols}, 1fr)` }}>
          <div className="p-4 bg-muted/30" />
          {partners.map(p => (
            <div key={p.id} className="p-4 border-l border-border relative">
              <button
                onClick={() => onRemove(p.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center text-center gap-2">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-border/50" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50">
                    <span className="font-bold text-primary text-xl">{p.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm text-foreground leading-tight">{p.name}</h3>
                  {p.partner_tier && p.partner_tier !== 'standard' && (
                    <Badge variant="outline" className={`text-xs mt-1 ${TIER_STYLES[p.partner_tier]}`}>
                      Featured Provider
                    </Badge>
                  )}
                </div>
                <Button asChild size="sm" className="rounded-full w-full mt-1 text-xs">
                  <Link to={partnerProfilePath(p.id)}>View Profile</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison rows */}
        <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${cols}, 1fr)` }}>

          {/* Rating */}
          <Row label="Rating">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-b border-border flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-sm">{p.rating > 0 ? p.rating : '—'}</span>
                {p.review_count > 0 && <span className="text-xs text-muted-foreground">({p.review_count})</span>}
              </div>
            ))}
          </Row>

          {/* Projects */}
          <Row label="Completed Projects">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-b border-border flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{p.completed_projects > 0 ? p.completed_projects : '—'}</span>
              </div>
            ))}
          </Row>

          {/* Location */}
          <Row label="Location">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-b border-border flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{p.location || '—'}</span>
              </div>
            ))}
          </Row>

          {/* Starting Price */}
          <Row label="Starting Price">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-b border-border flex items-center gap-1 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{p.starting_price > 0 ? `$${p.starting_price}` : '—'}</span>
              </div>
            ))}
          </Row>

          {/* Category */}
          <Row label="Category">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-b border-border text-sm text-muted-foreground">
                {CATEGORY_LABELS[p.service_category] || '—'}
              </div>
            ))}
          </Row>

          {/* Website */}
          <Row label="Website">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-b border-border text-sm">
                {p.website_url ? (
                  <a href={p.website_url} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 hover:underline truncate">
                    <Globe className="w-3.5 h-3.5 shrink-0" /> Visit
                  </a>
                ) : '—'}
              </div>
            ))}
          </Row>

          {/* Services */}
          <Row label="Services">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-b border-border">
                {p.services?.length > 0 ? (
                  <ul className="space-y-1">
                    {p.services.slice(0, 6).map(s => (
                      <li key={s} className="flex items-center gap-1.5 text-xs text-foreground">
                        <CheckCircle className="w-3 h-3 text-primary shrink-0" /> {s}
                      </li>
                    ))}
                    {p.services.length > 6 && <li className="text-xs text-muted-foreground">+{p.services.length - 6} more</li>}
                  </ul>
                ) : <span className="text-sm text-muted-foreground">—</span>}
              </div>
            ))}
          </Row>

          {/* Languages */}
          <Row label="Languages">
            {partners.map(p => (
              <div key={p.id} className="py-3 px-4 border-l border-border text-sm text-muted-foreground">
                {p.languages?.length > 0 ? p.languages.join(', ') : '—'}
              </div>
            ))}
          </Row>

        </div>
      </div>
    </div>
  );
}