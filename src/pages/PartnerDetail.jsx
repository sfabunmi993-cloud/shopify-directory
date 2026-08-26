import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MapPin, Globe, Mail, ArrowLeft, Award, Heart, Flag, MessageSquare, Hash, ShieldAlert, ChevronDown, ChevronUp, CheckCircle, Share2, Copy, Check, Send, Briefcase, BadgeCheck, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewSection from '@/components/directory/ReviewSection';
import RatingSummary from '@/components/directory/RatingSummary';
import PartnerAvatar from '@/components/directory/PartnerAvatar';
import PortfolioItemReview from '@/components/directory/PortfolioItemReview';
import PortfolioScroller from '@/components/directory/PortfolioScroller';
import TestimonialsScroller from '@/components/directory/TestimonialsScroller';
import ContactModal from '@/components/partner/ContactModal';
import FlagModal from '@/components/partner/FlagModal';
import PurchasePremiumModal from '@/components/partner/PurchasePremiumModal';
import BuyReviewModal from '@/components/partner/BuyReviewModal';
import BuyDomainModal from '@/components/partner/BuyDomainModal';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { partnerProfileUrl, stripShopifySuffix } from '@/lib/partnerUrl';

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
  if (reviewCount >= 150) return { label: 'Premium Partner', color: 'bg-amber-50 text-amber-700 border-amber-200', medal: '🥇' };
  if (reviewCount >= 50) return { label: 'Plus Partner', color: 'bg-primary/10 text-primary border-primary/20', medal: '🥈' };
  return { label: 'Standard Partner', color: 'bg-muted text-muted-foreground border-border', medal: '🥉' };
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
  const [buyReviewOpen, setBuyReviewOpen] = useState(false);
  const [buyDomainOpen, setBuyDomainOpen] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = partnerProfileUrl(stripShopifySuffix(slug));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partner', slug],
    queryFn: async () => {
      // Strip the .myshopify.com suffix used in profile URLs, then try slug first, fall back to id for legacy URLs
      const key = stripShopifySuffix(slug);
      const bySlug = await base44.entities.Partner.filter({ slug: key });
      if (bySlug.length > 0) return bySlug;
      return base44.entities.Partner.filter({ id: key });
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
    const wasFavorited = isFavorited;
    const prevFavId = favoriteId;

    // Optimistic: update UI immediately
    if (wasFavorited) {
      setIsFavorited(false);
      setFavoriteId(null);
    } else {
      setIsFavorited(true);
    }

    try {
      if (wasFavorited && prevFavId) {
        await base44.entities.Favorite.delete(prevFavId);
      } else {
        const fav = await base44.entities.Favorite.create({ user_id: user.id, partner_id: partnerId });
        setFavoriteId(fav.id);
      }
    } catch (err) {
      // Rollback on failure
      setIsFavorited(wasFavorited);
      setFavoriteId(prevFavId);
      toast.error('Could not update favorites. Please try again.');
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
        <p className="text-lg font-medium text-foreground">THIS ACCOUNT DOES NOT EXIST</p>
        

        
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
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl mx-auto">
      <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 hidden">Back to directory        

      </Link>

      {partner.status === 'pending' &&
      <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 text-amber-600 dark:text-amber-400 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0 hidden sm:block" />
          <span className="text-center sm:text-left flex-1">This profile is pending admin approval and is not yet visible in the directory. Purchase a domain name within 2 days — if the domain is not purchased, your account will be deleted by admin after 2 days.</span>
          {user && partner.created_by_id === user.id && !partner.domain_purchased &&
          <Button
            onClick={() => setBuyDomainOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-9 px-4 shrink-0">
            <Globe className="w-4 h-4" /> Buy Domain
          </Button>
          }
        </div>}

      {partner.admin_banner && user && (user.id === partner.created_by_id || user.role === 'admin') &&
      <div className="mb-4 border border-destructive/40 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-destructive-foreground bg-destructive">
          <Bell className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Urgent</p>
            <p>{partner.admin_banner}</p>
          </div>
        </div>
      }

      <div className="grid md:grid-cols-[300px_1fr] gap-4 sm:gap-8 items-start">

        {/* LEFT SIDEBAR CARD */}
        <div className="relative bg-white border border-[#E0E0E0] rounded-xl shadow-sm mt-10">
          {/* Avatar overlapping top edge */}
          <div className="absolute left-5 -top-10">
            <PartnerAvatar partner={partner} size="lg" shape="rounded-full" className="border-2 border-white shadow-md" />
          </div>

          {/* Partner tier badge */}
          {(() => {
            const tierLabel = partner.partner_tier === 'premium' ? 'PLATINUM' : partner.partner_tier === 'plus' ? 'PLUS' : '';
            return tierLabel ? (
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black text-white text-[10px] font-semibold tracking-wide px-2 py-1 rounded">
                <span className="w-3.5 h-3.5 bg-white text-black rounded-sm flex items-center justify-center text-[10px] font-bold leading-none">S</span>
                SHOPIFY {tierLabel} PARTNER
              </div>
            ) : null;
          })()}

          <div className="pt-16 px-5 pb-5 space-y-4">
            {/* Title + badges */}
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground leading-tight">{partner.name}</h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="inline-flex items-center text-xs px-2 py-0.5 border border-border bg-muted text-muted-foreground rounded-full">Service partner</span>
                {partner.is_verified &&
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
                }
                {partner.partner_number &&
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-0.5">
                  <Hash className="w-2.5 h-2.5" />{partner.partner_number}
                </span>
                }
              </div>
            </div>

            {/* Stats line */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {partner.rating > 0 &&
              <>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" style={{ fill: '#FFB81C', color: '#FFB81C' }} />
                  <span className="font-semibold text-foreground">{partner.rating}</span>
                  <span className="text-muted-foreground">({partner.review_count || 0})</span>
                </span>
                {partner.years_as_partner > 0 && <span className="text-border">|</span>}
              </>
              }
              {partner.years_as_partner > 0 &&
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" style={{ color: '#717171' }} />
                Partner since {new Date().getFullYear() - partner.years_as_partner}
              </span>
              }
            </div>

            {/* Contact button */}
            {contactHref ?
            <Button asChild className="w-full h-11 bg-[#202B33] hover:bg-[#202B33]/90 rounded-lg text-white font-medium">
              <a href={contactHref} target="_blank" rel="noopener noreferrer">Contact</a>
            </Button>
            :
            <Button className="w-full h-11 bg-[#202B33] hover:bg-[#202B33]/90 rounded-lg text-white font-medium" onClick={() => setContactOpen(true)}>
              Contact
            </Button>
            }

            {/* Secondary actions */}
            {partner.whatsapp_url &&
            <a
              href={partner.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 border text-sm font-medium h-9 px-4 py-2 transition-colors bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp
            </a>
            }

            {user && partner.created_by_id === user.id && partner.partner_tier !== 'premium' &&
            <button
              onClick={() => setPremiumOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-4 py-2 transition-colors bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-full">
              ✨ Get Premium Badge
            </button>
            }

            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border transition-all ${isFavorited ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'border-border text-muted-foreground hover:border-rose-500/30 hover:text-rose-400'}`}>
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
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      Share on X
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      Share on Facebook
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${partner?.name} on Shopify Partner Base: ${profileUrl}`)}`} target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      Share on WhatsApp
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={() => setFlagOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border border-border hover:text-destructive hover:border-destructive/30 transition-all text-muted-foreground">
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>

            <hr className="border-[#DFE3E8]" />

            {/* Info details */}
            <div className="space-y-4 text-sm">
              {partner.starting_price > 0 &&
              <div>
                <p className="text-sm font-semibold text-foreground">Price range for selected services</p>
                <p className="text-[#212121] mt-0.5">Starting from ${partner.starting_price}</p>
              </div>
              }

              {(partner.website_url || partner.email) &&
              <div>
                <p className="text-sm font-semibold text-foreground">Contact information</p>
                <div className="mt-1 flex flex-col gap-y-2">
                  {partner.website_url &&
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#212121] hover:underline break-all">
                    <Globe className="w-4 h-4 shrink-0" style={{ color: '#717171' }} />
                    {partner.website_url.replace(/^https?:\/\//, '')}
                  </a>
                  }
                  {partner.email &&
                  <a href={`mailto:${partner.email}`} className="flex items-center gap-2 text-[#212121] hover:underline break-all">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: '#717171' }} />
                    {partner.email}
                  </a>
                  }
                </div>
              </div>
              }

              {partner.location &&
              <div>
                <p className="text-sm font-semibold text-foreground">Primary location</p>
                <p className="text-[#212121] mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: '#717171' }} />
                  {partner.location}
                </p>
              </div>
              }

              {partner.country &&
              <div>
                <p className="text-sm font-semibold text-foreground">Supported locations</p>
                <p className="text-[#212121] mt-0.5">{partner.country}</p>
              </div>
              }

              {partner.languages?.length > 0 &&
              <div>
                <p className="text-sm font-semibold text-foreground">Languages</p>
                <p className="text-[#212121] mt-0.5">{partner.languages.join(', ')}</p>
              </div>
              }

              {partner.completed_projects > 0 &&
              <div>
                <p className="text-sm font-semibold text-foreground">Projects completed</p>
                <p className="text-[#212121] mt-0.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" style={{ color: '#717171' }} />
                  {partner.completed_projects}+
                </p>
              </div>
              }

              {[partner.instagram_url, partner.twitter_url, partner.linkedin_url, partner.facebook_url, partner.tiktok_url, partner.youtube_url].some(Boolean) &&
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Social media</p>
                <div className="flex flex-wrap gap-2">
                  {partner.instagram_url &&
                  <a href={partner.instagram_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 flex items-center justify-center text-white hover:opacity-90 transition-opacity" title="Instagram">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 002.13-1.38c.66-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 00-1.38-2.13A5.86 5.86 0 0019.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z" /><path d="M12 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84M12 16a4 4 0 110-8 4 4 0 010 8M18.41 7.03a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44" /></svg>
                  </a>
                  }
                  {partner.twitter_url &&
                  <a href={partner.twitter_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white hover:opacity-90 transition-opacity" title="Twitter / X">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  }
                  {partner.linkedin_url &&
                  <a href={partner.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:opacity-90 transition-opacity" title="LinkedIn">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 11-.01-4.12 2.06 2.06 0 01.01 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" /></svg>
                  </a>
                  }
                  {partner.facebook_url &&
                  <a href={partner.facebook_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity" title="Facebook">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" /></svg>
                  </a>
                  }
                  {partner.tiktok_url &&
                  <a href={partner.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white hover:opacity-90 transition-opacity" title="TikTok">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.55c.3 0 .6.05.88.13V9.4a6.33 6.33 0 00-.88-.05A6.34 6.34 0 005 15.69a6.34 6.34 0 0010.83 4.5V8.59a8.16 8.16 0 004.83 1.54V6.69h-1.07z" /></svg>
                  </a>
                  }
                  {partner.youtube_url &&
                  <a href={partner.youtube_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-90 transition-opacity" title="YouTube">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.2a3.02 3.02 0 00-2.13-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.37.51A3.02 3.02 0 00.5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 002.13 2.14c1.87.51 9.37.51 9.37.51s7.5 0 9.37-.51a3.02 3.02 0 002.13-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z" /></svg>
                  </a>
                  }
                </div>
              </div>
              }
            </div>

            {/* Owner-only actions */}
            <div className="space-y-2 pt-4 border-t border-[#DFE3E8]">
              {user && partner.created_by_id === user.id &&
              <button
                onClick={() => setBuyReviewOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-4 py-2 transition-colors bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-full">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Buy Reviews
              </button>
              }
              {user && partner.created_by_id === user.id && partner.status === 'pending' &&
              <button
                onClick={() => setBuyDomainOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-4 py-2 transition-colors bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                <Globe className="w-4 h-4" /> Buy Domain
              </button>
              }
            </div>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="space-y-6">

          {/* About */}
          <div className="px-5">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">About</h2>

            {partner.description &&
            <div className="mb-4">
                <h3 className="font-semibold mb-1 text-foreground">Business description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{partner.description}</p>
              </div>
            }

            {partner.full_description &&
            <div className="mb-4">
                <h3 className="font-semibold mb-1 text-foreground">{rankConfig.label}</h3>
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
              <div className="border border-border rounded-xl overflow-hidden bg-card">
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

          {/* Portfolio */}
          {partner.portfolio?.length > 0 &&
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">Portfolio</h2>
            <PortfolioScroller portfolio={partner.portfolio} partnerId={partnerId} />
          </motion.div>
          }

          {/* Testimonials */}
          {partner.testimonials?.length > 0 &&
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">Client Testimonials</h2>
            <TestimonialsScroller testimonials={partner.testimonials} />
          </motion.div>
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

          {/* Rating summary */}
          <RatingSummary partnerId={partnerId} rating={partner.rating} reviewCount={partner.review_count} />

          {/* Reviews */}
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Reviews</h2>
            <ReviewSection partnerId={partnerId} onReviewAdded={handleReviewAdded} unlimitedReviews={partner?.unlimited_reviews} partnerStatus={partner?.status} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {partner &&
      <>
          <ContactModal partner={partner} isOpen={contactOpen} onClose={() => setContactOpen(false)} />
          <ContactModal partner={partner} isOpen={hireOpen} onClose={() => setHireOpen(false)} mode="hire" />
          <FlagModal partner={partner} isOpen={flagOpen} onClose={() => setFlagOpen(false)} />
          <PurchasePremiumModal partner={partner} isOpen={premiumOpen} onClose={() => setPremiumOpen(false)} user={user} />
          <BuyReviewModal partner={partner} isOpen={buyReviewOpen} onClose={() => setBuyReviewOpen(false)} />
          <BuyDomainModal partner={partner} isOpen={buyDomainOpen} onClose={() => setBuyDomainOpen(false)} user={user} />
        </>
      }

      {/* Floating message button */}
      {user &&
      <button
        onClick={() => navigate('/messages')}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-105 hidden"
        title="Open messages">
        
          <MessageSquare className="w-6 h-6" />
        </button>
      }
    </div>);

}