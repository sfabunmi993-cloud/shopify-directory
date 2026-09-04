import React from 'react';
import { Link } from 'react-router-dom';
import { Star, User, Globe, Mail, MapPin, Hash, BadgeCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { partnerProfilePath } from '@/lib/partnerUrl';
import PartnerAvatar from '@/components/directory/PartnerAvatar';

/**
 * Read-only preview sidebar shown on the partner's own account (MyProfile) page,
 * mirroring the public partner profile sidebar so the editor matches the reference
 * two-column layout. All fields are display-only.
 */
export default function ProfilePreviewSidebar({ partner }) {
  if (!partner) return null;

  const isFeatured = partner.partner_tier === 'premium' || partner.partner_tier === 'plus';
  const partnerSinceYear = partner.years_as_partner > 0 ? new Date().getFullYear() - partner.years_as_partner : null;

  return (
    <div className="relative bg-white border border-[#E0E0E0] rounded-xl shadow-sm md:mt-10">
      {/* Avatar overlapping top edge */}
      <div className="absolute left-5 -top-10">
        <PartnerAvatar partner={partner} size="lg" shape="rounded-full" className="border-2 border-white shadow-md" />
      </div>

      {/* Featured provider badge */}
      {isFeatured && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black text-white text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full">
          FEATURED PROVIDER
        </div>
      )}

      <div className="pt-16 px-5 pb-5 space-y-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground leading-tight">{partner.name}</h1>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center text-xs px-2 py-0.5 border border-border bg-muted text-muted-foreground rounded-full">Service partner</span>
            {partner.is_verified && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
            {partner.partner_number && (
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-0.5">
                <Hash className="w-2.5 h-2.5" />{partner.partner_number}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {partner.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" style={{ fill: '#FFB81C', color: '#FFB81C' }} />
              <span className="font-semibold text-foreground">{partner.rating}</span>
              <span className="text-muted-foreground">({partner.review_count || 0})</span>
            </span>
          )}
          {partnerSinceYear && <span className="text-border">|</span>}
          {partnerSinceYear && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" style={{ color: '#717171' }} />
              Joined {partnerSinceYear}
            </span>
          )}
        </div>

        <Button asChild className="w-full h-11 bg-[#202B33] hover:bg-[#202B33]/90 rounded-lg text-white font-medium">
          <Link to={partnerProfilePath(partner.slug || partner.id)}>
            <Eye className="w-4 h-4 mr-1.5" /> View public profile
          </Link>
        </Button>

        <hr className="border-[#DFE3E8]" />

        <div className="space-y-4 text-sm">
          {partner.starting_price > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Price range for selected services</p>
              <p className="text-[#212121] mt-0.5">Starting from ${partner.starting_price}</p>
            </div>
          )}

          {(partner.website_url || partner.email) && (
            <div>
              <p className="text-sm font-semibold text-foreground">Contact information</p>
              <div className="mt-1 flex flex-col gap-y-2">
                {partner.website_url && (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#212121] hover:underline break-all">
                    <Globe className="w-4 h-4 shrink-0" style={{ color: '#717171' }} />
                    {partner.website_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {partner.email && (
                  <a href={`mailto:${partner.email}`} className="flex items-center gap-2 text-[#212121] hover:underline break-all">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: '#717171' }} />
                    {partner.email}
                  </a>
                )}
              </div>
            </div>
          )}

          {partner.location && (
            <div>
              <p className="text-sm font-semibold text-foreground">Primary location</p>
              <p className="text-[#212121] mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: '#717171' }} />
                {partner.location}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}