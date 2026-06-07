import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export default function PartnerCard({ partner }) {
  const displayedServices = partner.services?.slice(0, 4) || [];
  const extraCount = (partner.services?.length || 0) - 4;

  return (
    <Link
      to={`/partner/${partner.id}`}
      className="block bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-border/80 transition-all duration-200 group"
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          {partner.logo_url ? (
            <img src={partner.logo_url} alt={partner.name} className="w-14 h-14 rounded-lg object-cover border border-border/50" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50">
              <span className="font-heading font-bold text-primary text-lg">
                {partner.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
              {partner.name}
            </h3>
            {partner.partner_tier && partner.partner_tier !== 'standard' && (
              <Badge variant="outline" className={`text-xs shrink-0 ${TIER_STYLES[partner.partner_tier]}`}>
                {partner.partner_tier.charAt(0).toUpperCase() + partner.partner_tier.slice(1)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
            {partner.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{partner.rating}</span>
                <span>({partner.review_count || 0})</span>
              </span>
            )}
            {partner.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {partner.location}
              </span>
            )}
          </div>

          {partner.starting_price > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-sm">
              <span className="text-muted-foreground">Price range for services</span>
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-foreground">Starting from ${partner.starting_price}</span>
            </div>
          )}

          {displayedServices.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-muted-foreground">Services </span>
              <span className="text-xs text-foreground">
                {displayedServices.join(', ')}
                {extraCount > 0 && <span className="text-muted-foreground"> + {extraCount} more</span>}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}