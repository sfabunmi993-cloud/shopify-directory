import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MapPin, DollarSign, Globe, Mail, ArrowLeft, CheckCircle, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ReviewSection from '@/components/directory/ReviewSection';

const CATEGORY_LABELS = {
  marketing_and_sales: 'Marketing & Sales',
  store_setup_and_management: 'Store Setup & Management',
  development_and_troubleshooting: 'Development & Troubleshooting',
  visual_content_and_branding: 'Visual Content & Branding',
  content_writing: 'Content Writing',
  expert_guidance: 'Expert Guidance',
};

const TIER_CONFIG = {
  standard: { label: 'Standard', color: 'bg-muted text-muted-foreground' },
  plus: { label: 'Plus', color: 'bg-primary/10 text-primary' },
  premium: { label: 'Premium', color: 'bg-amber-50 text-amber-700' },
};

export default function PartnerDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partner', id],
    queryFn: () => base44.entities.Partner.filter({ id }),
    enabled: !!id,
  });

  const partner = partners?.[0];

  const handleReviewAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['partner', id] });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="flex gap-6">
          <Skeleton className="w-20 h-20 rounded-xl" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
        <Skeleton className="h-40 w-full mt-8 rounded-xl" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium">Partner not found</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/directory"><ArrowLeft className="w-4 h-4 mr-1" /> Back to directory</Link>
        </Button>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[partner.partner_tier] || TIER_CONFIG.standard;

  const gmailComposeUrl = partner.email
    ? `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(partner.email)}&su=${encodeURIComponent(`Inquiry from Partners Directory - ${partner.name}`)}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to directory
      </Link>

      {/* Header */}
      <div className="bg-white border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-5">
          {partner.logo_url ? (
            <img src={partner.logo_url} alt={partner.name} className="w-20 h-20 rounded-xl object-cover border border-border/50 shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50 shrink-0">
              <span className="font-heading font-bold text-primary text-2xl">{partner.name?.charAt(0)?.toUpperCase()}</span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{partner.name}</h1>
              <Badge className={`${tierConfig.color} text-xs`}>
                <Award className="w-3 h-3 mr-1" />
                {tierConfig.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              {partner.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{partner.rating}</span>
                  ({partner.review_count || 0} reviews)
                </span>
              )}
              {partner.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {partner.location}
                </span>
              )}
              {partner.starting_price > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Starting from ${partner.starting_price}
                </span>
              )}
            </div>

            {partner.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{partner.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {partner.website_url && (
            <Button asChild variant="default" className="rounded-full">
              <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-1.5" /> Visit Website
              </a>
            </Button>
          )}
          {gmailComposeUrl && (
            <Button asChild variant="outline" className="rounded-full">
              <a href={gmailComposeUrl} target="_blank" rel="noopener noreferrer">
                <Mail className="w-4 h-4 mr-1.5" /> Contact
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-[1fr_280px] gap-6 mt-6">
        <div className="space-y-6">
          {/* About */}
          {partner.full_description && (
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-heading text-lg font-semibold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{partner.full_description}</p>
            </div>
          )}

          {/* Services */}
          {partner.services?.length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Services offered</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {partner.services.map((service, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {service}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection partnerId={id} onReviewAdded={handleReviewAdded} />
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-sm">Details</h3>
            <Separator />
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{CATEGORY_LABELS[partner.service_category] || partner.service_category}</p>
              </div>
              {partner.completed_projects > 0 && (
                <div>
                  <p className="text-muted-foreground">Completed projects</p>
                  <p className="font-medium">{partner.completed_projects}</p>
                </div>
              )}
              {partner.languages?.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Languages</p>
                  <p className="font-medium">{partner.languages.join(', ')}</p>
                </div>
              )}
              {partner.country && (
                <div>
                  <p className="text-muted-foreground">Country</p>
                  <p className="font-medium">{partner.country}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}