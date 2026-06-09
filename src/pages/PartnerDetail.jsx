import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MapPin, Globe, Mail, Phone, ArrowLeft, Award, Heart, Flag, Briefcase, MessageSquare, Hash, ShieldAlert, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewSection from '@/components/directory/ReviewSection';
import ContactModal from '@/components/partner/ContactModal';
import FlagModal from '@/components/partner/FlagModal';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  marketing_and_sales: 'Marketing & Sales',
  store_setup_and_management: 'Store Setup & Management',
  development_and_troubleshooting: 'Development & Troubleshooting',
  visual_content_and_branding: 'Visual Content & Branding',
  content_writing: 'Content Writing',
  expert_guidance: 'Expert Guidance',
};

const INDUSTRY_LABELS = {
  technology: 'Technology',
  healthcare: 'Healthcare',
  finance: 'Finance',
  retail: 'Retail',
  education: 'Education',
  manufacturing: 'Manufacturing',
  real_estate: 'Real Estate',
  hospitality: 'Hospitality',
  creative: 'Creative',
  other: 'Other',
};

const TIER_CONFIG = {
  standard: { label: 'Standard Partner', color: 'bg-muted text-muted-foreground border-border' },
  plus: { label: 'Plus Partner', color: 'bg-primary/10 text-primary border-primary/20' },
  premium: { label: 'Premium Partner', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function getPartnerRank(reviewCount = 0) {
  if (reviewCount >= 25) return { label: 'Plus Partner', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (reviewCount >= 5) return { label: 'Pro Partner', color: 'bg-primary/10 text-primary border-primary/20' };
  return { label: 'Basic Partner', color: 'bg-muted text-muted-foreground border-border' };
}

function ServiceRow({ service, description }) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{service}</span>
        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export default function PartnerDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [hireOpen, setHireOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partner', id],
    queryFn: () => base44.entities.Partner.filter({ id }),
    enabled: !!id,
  });

  const partner = partners?.[0];

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const me = await base44.auth.me();
      setUser(me);
      const favs = await base44.entities.Favorite.filter({ user_id: me.id, partner_id: id });
      if (favs.length > 0) {
        setIsFavorited(true);
        setFavoriteId(favs[0].id);
      }
    };
    init();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user) { toast.error('Please log in to save favorites.'); return; }
    if (isFavorited && favoriteId) {
      await base44.entities.Favorite.delete(favoriteId);
      setIsFavorited(false);
      setFavoriteId(null);
      toast.success('Removed from favorites');
    } else {
      const fav = await base44.entities.Favorite.create({ user_id: user.id, partner_id: id });
      setIsFavorited(true);
      setFavoriteId(fav.id);
      toast.success('Saved to favorites!');
    }
  };

  const handleReviewAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['partner', id] });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          <div className="space-y-4">
            <Skeleton className="w-28 h-28 rounded-full mx-auto" />
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-32 w-full rounded" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded" />
            <Skeleton className="h-48 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium">Partner not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/directory"><ArrowLeft className="w-4 h-4 mr-1" /> Back to directory</Link>
        </Button>
      </div>
    );
  }

  if (partner.status === 'restricted') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">This account has been restricted</p>
        {partner.restriction_reason && (
          <p className="text-sm text-muted-foreground mt-2">Reason: {partner.restriction_reason}</p>
        )}
        <Button asChild variant="outline" className="mt-6">
          <Link to="/directory"><ArrowLeft className="w-4 h-4 mr-1" /> Back to directory</Link>
        </Button>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[partner.partner_tier] || TIER_CONFIG.standard;
  const rankConfig = getPartnerRank(partner.review_count);
  const visibleServices = showAllServices ? partner.services : partner.services?.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to directory
      </Link>

      {partner.status === 'pending' && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-700 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>This profile is pending admin approval and is not yet visible in the directory.</span>
        </div>
      )}

      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">

        {/* LEFT SIDEBAR */}
        <div className="border border-border rounded-xl bg-white p-6 space-y-5">
          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            {partner.logo_url ? (
              <img src={partner.logo_url} alt={partner.name} className="w-24 h-24 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-border">
                <span className="font-heading font-bold text-primary text-3xl">{partner.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
            {/* Rank badge */}
            <div className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${rankConfig.color}`}>
              <Award className="w-3 h-3" /> {rankConfig.label}
            </div>
          </div>

          {/* Name */}
          <div className="text-center">
            <h1 className="font-heading text-xl font-bold text-foreground">{partner.name}</h1>
            {partner.partner_number && (
              <span className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-0.5 mt-0.5">
                <Hash className="w-2.5 h-2.5" />{partner.partner_number}
              </span>
            )}
          </div>

          {/* Rating */}
          {partner.rating > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{partner.rating}</span>
              <span className="text-muted-foreground">({partner.review_count || 0})</span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button className="w-full" onClick={() => setContactOpen(true)}>
              <MessageSquare className="w-4 h-4 mr-1.5" /> Contact
            </Button>
            <Button variant="outline" className="w-full text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={() => setHireOpen(true)}>
              <Briefcase className="w-4 h-4 mr-1.5" /> Hire Partner
            </Button>
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border transition-all ${isFavorited ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-border text-muted-foreground hover:border-rose-200 hover:text-rose-400'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => setFlagOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border border-border text-muted-foreground hover:text-red-500 hover:border-red-200 transition-all"
              >
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>
          </div>

          {/* Info details */}
          <div className="space-y-3 text-sm pt-1 border-t border-border">
            {partner.starting_price > 0 && (
              <div>
                <p className="text-primary font-semibold text-xs uppercase tracking-wide">Price range for selected services</p>
                <p className="text-muted-foreground">Starting from ${partner.starting_price}</p>
              </div>
            )}
            {(partner.website_url || partner.email) && (
              <div>
                <p className="text-primary font-semibold text-xs uppercase tracking-wide">Contact information</p>
                {partner.website_url && (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline mt-1">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{partner.website_url.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {partner.email && (
                  <a href={`mailto:${partner.email}`} className="flex items-center gap-1.5 text-primary hover:underline mt-1">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{partner.email}</span>
                  </a>
                )}
              </div>
            )}
            {partner.location && (
              <div>
                <p className="text-primary font-semibold text-xs uppercase tracking-wide">Primary location</p>
                <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{partner.location}
                </p>
              </div>
            )}
            {partner.languages?.length > 0 && (
              <div>
                <p className="text-primary font-semibold text-xs uppercase tracking-wide">Languages</p>
                <p className="text-primary mt-0.5">{partner.languages.join(', ')}</p>
              </div>
            )}
            {partner.completed_projects > 0 && (
              <div>
                <p className="text-primary font-semibold text-xs uppercase tracking-wide">Completed projects</p>
                <p className="text-muted-foreground mt-0.5">{partner.completed_projects}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="space-y-6">

          {/* About */}
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">About</h2>

            {partner.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary mb-1">Business description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{partner.description}</p>
              </div>
            )}

            {partner.full_description && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary mb-1">{rankConfig.label}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{partner.full_description}</p>
              </div>
            )}

            {/* Tags */}
            {partner.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {partner.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          {partner.services?.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Specialized services</h2>
              <div className="border border-border rounded-xl overflow-hidden bg-white">
                {visibleServices.map((service, i) => (
                  <ServiceRow key={i} service={service} description={partner.service_descriptions?.[service]} />
                ))}
              </div>
              {partner.services.length > 5 && (
                <button
                  onClick={() => setShowAllServices(v => !v)}
                  className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {showAllServices ? (
                    <><ChevronUp className="w-4 h-4" /> Show fewer services</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show all {partner.services.length} services</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Category & Industry */}
          {(partner.service_category || partner.industry) && (
            <div>
              {partner.service_category && (
                <div className="mb-3">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-1">Category</h2>
                  <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[partner.service_category] || partner.service_category}</p>
                </div>
              )}
              {partner.industry && (
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-1">Industries</h2>
                  <p className="text-sm text-muted-foreground">{INDUSTRY_LABELS[partner.industry] || partner.industry}</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Reviews</h2>
            <ReviewSection partnerId={id} onReviewAdded={handleReviewAdded} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {partner && (
        <>
          <ContactModal partner={partner} isOpen={contactOpen} onClose={() => setContactOpen(false)} mode="inquiry" />
          <ContactModal partner={partner} isOpen={hireOpen} onClose={() => setHireOpen(false)} mode="hire" />
          <FlagModal partner={partner} isOpen={flagOpen} onClose={() => setFlagOpen(false)} />
        </>
      )}
    </div>
  );
}