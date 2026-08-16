import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, DollarSign, Hash, Briefcase, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PartnerAvatar from '@/components/directory/PartnerAvatar';
import { partnerProfilePath } from '@/lib/partnerUrl';

const CATEGORY_LABELS = {
  marketing_and_sales: 'Marketing & Sales',
  store_setup_and_management: 'Store Setup',
  development_and_troubleshooting: 'Development',
  visual_content_and_branding: 'Visual Content',
  content_writing: 'Content Writing',
  expert_guidance: 'Expert Guidance'
};

const TIER_STYLES = {
  standard: 'bg-muted text-muted-foreground',
  plus: 'bg-primary/10 text-primary',
  premium: 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function PartnerCard({ partner, compareSelected, onToggleCompare }) {
  const displayedServices = partner.services?.slice(0, 4) || [];
  const extraCount = (partner.services?.length || 0) - 4;

  return (
    <div className={`relative border rounded-xl p-5 hover:shadow-md transition-all duration-200 group my-2 bg-card text-card-foreground ${compareSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-border/80'}`}>
      






      
    <Link
        to={partnerProfilePath(partner.slug || partner.id)}
        className="block">
        
      <div className="flex gap-4">
        <div className="shrink-0">
          <PartnerAvatar partner={partner} size="md" shape="rounded-lg" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate flex items-center gap-1.5">
                {partner.name}
              </h3>
              {partner.partner_number &&
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-0.5">
                  <Hash className="w-2.5 h-2.5" />{partner.partner_number}
                  {partner.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-0.5" />}
                </span>
                }
            </div>
            {partner.partner_tier && partner.partner_tier !== 'standard' &&
              <Badge variant="outline" className={`text-xs shrink-0 my-1 ${TIER_STYLES[partner.partner_tier]}`}>
                {partner.partner_tier.charAt(0).toUpperCase() + partner.partner_tier.slice(1)}
              </Badge>
              }
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
            {partner.rating > 0 &&
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{partner.rating}</span>
                <span>({partner.review_count || 0})</span>
              </span>
              }
            {partner.location &&
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {partner.location}
              </span>
              }
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            {partner.starting_price > 0 &&
              <span className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium text-foreground">From ${partner.starting_price}</span>
              </span>
              }
            




              
          </div>

          {displayedServices.length > 0 &&
            <div className="mt-3">
              <span className="text-xs font-medium text-muted-foreground">Services </span>
              <span className="text-xs text-foreground">
                {displayedServices.join(', ')}
                {extraCount > 0 && <span className="text-muted-foreground"> + {extraCount} more</span>}
              </span>
            </div>
            }
          {partner.tags?.slice(0, 3).length > 0 &&
            <div className="flex flex-wrap gap-1 mt-2">
              {partner.tags.slice(0, 3).map((tag) =>
              <span key={tag} className="text-xs px-2 py-0.5 bg-primary/8 text-primary/70 rounded-full">#{tag}</span>
              )}
            </div>
            }
        </div>
      </div>
    </Link>
    </div>);

}