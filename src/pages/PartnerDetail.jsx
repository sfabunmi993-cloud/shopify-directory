import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MapPin, Globe, Mail, ArrowLeft, Award, Heart, Flag, MessageSquare, Hash, ShieldAlert, ChevronDown, ChevronUp, CheckCircle, Share2, Copy, Check, Send, Briefcase, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewSection from '@/components/directory/ReviewSection';
import PartnerAvatar from '@/components/directory/PartnerAvatar';
import ContactModal from '@/components/partner/ContactModal';
import FlagModal from '@/components/partner/FlagModal';
import PurchasePremiumModal from '@/components/partner/PurchasePremiumModal';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  marketing_and_sales: 'Marketing & Sales',
  store_setup_and_management: 'Store Setup & Management',
  development_and_troubleshooting: 'Development & Troubleshooting',
  visual_content_and_branding: 'Visual Content & Branding',
  content_writing: 'Content Writing',
  expert_guidance: 'Expert Guidance'
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
  other: 'Other'
};

const TIER_CONFIG = {
  standard: { label: 'Standard Partner', color: 'bg-muted text-muted-foreground border-border' },
  plus: { label: 'Plus Partner', color: 'bg-primary/10 text-primary border-primary/20' },
  premium: { label: 'Premium Partner', color: 'bg-amber-50 text-amber-700 border-amber-200' }
};

function getPartnerRank(reviewCount = 0) {
  if (reviewCount >= 25) return { label: 'Plus Partner', color: 'bg-amber-50 text-amber-700 border-amber-200', medal: '🥇' };
  if (reviewCount >= 5) return { label: 'Pro Partner', color: 'bg-primary/10 text-primary border-primary/20', medal: '🥈' };
  return { label: 'Basic Partner', color: 'bg-muted text-muted-foreground border-border', medal: '🥉' };
}

function ServiceRow({ service, description }) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{service}</span>
        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
      </div>
      {description &&
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      }
    </div>);

}

export default function PartnerDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [hireOpen, setHireOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = `${window.location.origin}/partner/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partner', slug],
    queryFn: async () => {
      // Try slug first, fall back to id for legacy URLs
      const bySlug = await base44.entities.Partner.filter({ slug });
      if (bySlug.length > 0) return bySlug;
      return base44.entities.Partner.filter({ id: slug });
    },
    enabled: !!slug
  });

  const partner = partners?.[0];
  const partnerId = partner?.id;

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const me = await base44.auth.me();
      setUser(me);
      if (!partnerId) return;
      const favs = await base44.entities.Favorite.filter({ user_id: me.id, partner_id: partnerId });
      if (favs.length > 0) {
        setIsFavorited(true);
        setFavoriteId(favs[0].id);
      }
    };
    init();
  }, [partnerId]);

  const handleToggleFavorite = async () => {
    if (!user) {toast.error('Please log in to save favorites.');return;}
    if (isFavorited && favoriteId) {
      await base44.entities.Favorite.delete(favoriteId);
      setIsFavorited(false);
      setFavoriteId(null);
      toast.success('Removed from favorites');
    } else {
      const fav = await base44.entities.Favorite.create({ user_id: user.id, partner_id: partnerId });
      setIsFavorited(true);
      setFavoriteId(fav.id);
      toast.success('Saved to favorites!');
    }
  };

  const handleReviewAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['partner', slug] });
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
      </div>);

  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium">Partner not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/directory"><ArrowLeft className="w-4 h-4 mr-1" /> Back to directory</Link>
        </Button>
      </div>);

  }

  if (partner.status === 'restricted') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">This account has been restricted</p>
        {partner.restriction_reason &&
        <p className="text-sm text-muted-foreground mt-2">Reason: {partner.restriction_reason}</p>
        }
        <Button asChild variant="outline" className="mt-6">
          <Link to="/directory"><ArrowLeft className="w-4 h-4 mr-1" /> Back to directory</Link>
        </Button>
      </div>);

  }

  const tierConfig = TIER_CONFIG[partner.partner_tier] || TIER_CONFIG.standard;
  const rankConfig = getPartnerRank(partner.review_count);
  const visibleServices = showAllServices ? partner.services : partner.services?.slice(0, 5);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const contactHref = partner.email ?
  isMobile ?
  `mailto:${partner.email}?subject=Inquiry - ${encodeURIComponent(partner.name)}` :
  `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(partner.email)}&su=${encodeURIComponent(`Inquiry - ${partner.name}`)}` :
  null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-500">
      <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">Back to directory        

      </Link>

      {partner.status === 'pending' &&
      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-700 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>This profile is pending admin approval and is not yet visible in the directory.</span>
        </div>
      }

      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">

        {/* LEFT SIDEBAR */}
        <div className="border border-border rounded-xl p-6 space-y-5">
          {/* Logo */}
          <div className="flex flex-col items-center text-center rounded-[999px]">
            <PartnerAvatar partner={partner} size="lg" shape="rounded-full" className="border-2" />
            {/* Rank badge */}
            <div className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 border font-medium bg-[#ffd700] rounded-[14px] ${rankConfig.color}`}>
              <Award className="w-3 h-3" /> {rankConfig.label}
            </div>
          </div>

          {/* Name */}
          <div className="text-center">
            <h1 className="font-heading text-base font-thin underline text-center lowercase text-gray-950">{partner.name}</h1>
            {partner.partner_number &&
            <span className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-0.5 mt-0.5">
                <Hash className="w-2.5 h-2.5" />{partner.partner_number}
              </span>
            }
            {partner.is_verified &&
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium mt-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </span>
            }
            {partner.partner_tier === 'premium' &&
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
                ✨ Premium
              </span>
            }
          </div>

          {/* Rating */}
          {partner.rating > 0 &&
          <div className="flex items-center justify-center gap-1.5 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{partner.rating}</span>
              <span className="text-muted-foreground">({partner.review_count || 0})</span>
            </div>
          }

          {/* CTA Buttons */}
          <div className="space-y-2">
            {contactHref ?
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 text-sm font-medium transition-colors bg-gray-600 rounded-2xl">
                <Mail className="w-4 h-4" /> Contact
              </a> :

            <Button className="w-full" onClick={() => setContactOpen(true)}>
                <MessageSquare className="w-4 h-4 mr-1.5" /> Contact
              </Button>
            }
            {partner.whatsapp_url &&
            <a
              href={partner.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 border text-sm font-medium h-9 px-4 py-2 transition-colors bg-green-50 border-green-200 text-green-700 hover:bg-green-100 rounded-full">
              
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp
              </a>
            }

            {/* Hire Me button */}
            <button
              onClick={() => navigate('/messages')}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-4 py-2 transition-colors bg-primary text-white hover:bg-primary/90 rounded-full shadow-sm"
            >
              <Briefcase className="w-4 h-4" /> Hire Me
            </button>

            {/* Get Premium Badge — only for the partner owner without premium */}
            {user && partner.created_by_id === user.id && partner.partner_tier !== 'premium' &&
            <button
                onClick={() => setPremiumOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-4 py-2 transition-colors bg-amber-500 text-white hover:bg-amber-600 rounded-full shadow-sm"
              >
                ✨ Get Premium Badge
              </button>
            }
            

            
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border transition-all ${isFavorited ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-border text-muted-foreground hover:border-rose-200 hover:text-rose-400'}`}>
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${partner?.name} on Shopify Partner Base`)}&url=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      Share on X
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Share on Facebook
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${partner?.name} on Shopify Partner Base: ${profileUrl}`)}`} target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Share on WhatsApp
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>








              
              <button
                onClick={() => setFlagOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border border-border hover:text-red-500 hover:border-red-200 transition-all text-[#050505]">
                
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>
          </div>

          {/* Info details */}
          <div className="space-y-3 text-sm pt-1 border-t border-border text-gray-700">
            {partner.starting_price > 0 &&
            <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-gray-700">PRICE RANGE FOR SELECTED SERVICES</p>
                <p className="text-muted-foreground">Starting from ${partner.starting_price}</p>
              </div>
            }
            {(partner.website_url || partner.email) &&
            <div className="text-gray-800">
                <p className="font-semibold text-xs uppercase tracking-wide text-gray-700">CONTACT INFORMATION</p>
                {partner.website_url &&
              <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline mt-1">
                    <Globe className="w-3.5 h-3.5 shrink-0 text-[#000000]" />
                    <span className="truncate text-[#494141]">{partner.website_url.replace(/^https?:\/\//, '')}</span>
                  </a>
              }
                {partner.email &&
              <a href={`mailto:${partner.email}`} className="flex items-center gap-1.5 text-primary hover:underline mt-1">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-gray-950" />
                    <span className="truncate text-gray-700">{partner.email}</span>
                  </a>
              }
              </div>
            }
            {partner.location &&
            <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-gray-700">PRIMARY LOCATION</p>
                <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{partner.location}
                </p>
              </div>
            }
            {partner.languages?.length > 0 &&
            <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-[#020303]">LANGUAGES</p>
                <p className="mt-0.5 text-gray-700">{partner.languages.join(', ')}</p>
              </div>
            }
            {partner.completed_projects > 0 &&
            <div>
                <p className="text-primary font-semibold text-xs uppercase tracking-wide">Completed projects</p>
                <p className="text-muted-foreground mt-0.5">{partner.completed_projects}</p>
              </div>
            }
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="space-y-6">

          {/* About */}
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">About</h2>

            {partner.description &&
            <div className="mb-4">
                <h3 className="font-semibold mb-1 text-[#5a5e5c]">Business description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{partner.description}</p>
              </div>
            }

            {partner.full_description &&
            <div className="mb-4">
                <h3 className="font-semibold mb-1 text-[#515855]">{rankConfig.label}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{partner.full_description}</p>
              </div>
            }

            {/* Tags */}
            {partner.tags?.length > 0 &&
            <div className="flex flex-wrap gap-1.5 mt-3">
                {partner.tags.map((tag) =>
              <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
              )}
              </div>
            }
          </div>

          {/* Services */}
          {partner.services?.length > 0 &&
          <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Specialized services</h2>
              <div className="border border-border rounded-xl overflow-hidden bg-white">
                {visibleServices.map((service, i) =>
              <ServiceRow key={i} service={service} description={partner.service_descriptions?.[service]} />
              )}
              </div>
              {partner.services.length > 5 &&
            <button
              onClick={() => setShowAllServices((v) => !v)}
              className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline">
              
                  {showAllServices ?
              <><ChevronUp className="w-4 h-4" /> Show fewer services</> :

              <><ChevronDown className="w-4 h-4" /> Show all {partner.services.length} services</>
              }
                </button>
            }
            </div>
          }

          {/* Category & Industry */}
          {(partner.service_category || partner.industry) &&
          <div>
              {partner.service_category &&
            <div className="mb-3">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-1">Category</h2>
                  <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[partner.service_category] || partner.service_category}</p>
                </div>
            }
              {partner.industry &&
            <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-1">Industries</h2>
                  <p className="text-sm text-muted-foreground">{INDUSTRY_LABELS[partner.industry] || partner.industry}</p>
                </div>
            }
            </div>
          }

          {/* Dashboard Screenshot */}
          {partner.dashboard_screenshot_url &&
          <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">Shopify Partner Dashboard</h2>
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={partner.dashboard_screenshot_url} alt="Shopify Partner Dashboard" className="w-full object-cover" />
              </div>
            </div>
          }

          {/* Reviews */}
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Reviews</h2>
            <ReviewSection partnerId={partnerId} onReviewAdded={handleReviewAdded} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {partner &&
      <>
          <ContactModal partner={partner} isOpen={contactOpen} onClose={() => setContactOpen(false)} mode="inquiry" />
          <ContactModal partner={partner} isOpen={hireOpen} onClose={() => setHireOpen(false)} mode="hire" />
          <FlagModal partner={partner} isOpen={flagOpen} onClose={() => setFlagOpen(false)} />
          <PurchasePremiumModal partner={partner} isOpen={premiumOpen} onClose={() => setPremiumOpen(false)} user={user} />
        </>
      }

      {/* Floating message button */}
      {user && (
        <button
          onClick={() => navigate('/messages')}
          className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          title="Open messages"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>);

}