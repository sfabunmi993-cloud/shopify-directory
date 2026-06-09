import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MapPin, Globe, Mail, Phone, ArrowLeft, Award, Heart, Flag, Briefcase, MessageSquare, Hash, ShieldAlert, ChevronDown, ChevronUp, CheckCircle, Share2 } from 'lucide-react';
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
      {description &&
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      }
    </div>);

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
    enabled: !!id
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
    if (!user) {toast.error('Please log in to save favorites.');return;}
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-500">
      <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to directory
      </Link>

      {partner.status === 'pending' &&
      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-700 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>This profile is pending admin approval and is not yet visible in the directory.</span>
        </div>
      }

      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">

        {/* LEFT SIDEBAR */}
        <div className="border border-border rounded-xl bg-white p-6 space-y-5">
          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            {partner.logo_url ?
            <img src={partner.logo_url} alt={partner.name} className="w-24 h-24 rounded-full object-cover border-2 border-border" /> :

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-border">
                <span className="font-heading font-bold text-primary text-3xl">{partner.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            }
            {/* Rank badge */}
            <div className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium text-[#b46227] ${rankConfig.color}`}>
              <Award className="w-3 h-3" /> {rankConfig.label}
            </div>
          </div>

          {/* Name */}
          <div className="text-center">
            <h1 className="font-heading text-xl font-bold text-foreground">{partner.name}</h1>
            {partner.partner_number &&
            <span className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-0.5 mt-0.5">
                <Hash className="w-2.5 h-2.5" />{partner.partner_number}
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
            {partner.email ?
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(partner.email)}&su=${encodeURIComponent(`Inquiry - ${partner.name}`)}`}
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium h-9 px-4 py-2 transition-colors bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp
              </a>
            }
            

            
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border transition-all ${isFavorited ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-border text-muted-foreground hover:border-rose-200 hover:text-rose-400'}`}>
                
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Profile link copied!');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
                
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button
                onClick={() => setFlagOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border border-border text-muted-foreground hover:text-red-500 hover:border-red-200 transition-all">
                
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
          <div className="<div><h2 class=\"richtext text-t6 flex items-center pb-4\"><span>Rating</span><svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" class=\"ml-2\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5.19974 17.9999C5.03414 17.9999 4.86934 17.9487 4.73014 17.8479C4.49014 17.6735 4.36533 17.3808 4.40774 17.0864L5.15094 11.8833L2.23412 8.96581C2.02212 8.75382 1.94692 8.44183 2.03812 8.15624C2.12932 7.87065 2.37252 7.66025 2.66772 7.61146L7.06615 6.87788L9.28376 2.44281C9.42056 2.17002 9.72057 1.99003 10.0038 2.00043C10.3086 2.00203 10.5854 2.17642 10.719 2.45081L12.8422 6.81228L17.3398 7.61306C17.6334 7.66505 17.8734 7.87625 17.963 8.16024C18.0526 8.44503 17.9766 8.75542 17.7654 8.96581L14.8478 11.8833L15.5918 17.0864C15.6334 17.3824 15.5086 17.6767 15.2654 17.8503C15.023 18.0247 14.703 18.0479 14.4382 17.9135L10.0558 15.6944L5.55414 17.9167C5.44214 17.9727 5.32054 5.19974 17.9999Z\" fill=\"#F5C452\"></path></svg><span class=\"pl-1 text-body-lg font-normal\">5.0</span><span font-normal\">(<!-- -->1176<!-- -->)</span></h2><h3 text-t7 mb-3\">Overall rating summary</h3><p class=\"text-sm\">Ratings based on<!-- -->&nbsp;<span class=\"relative inline-flex justify-content items-center\"><button class=\"flex-auto focus:outline-state-focus\" aria-controls=\"quality-of-work\" aria-expanded=\"false\" id=\"toggle-button-quality-of-work\" type=\"button\"><b class=\"underline decoration-dotted text-sm\">quality of work</b></button><span aria-hidden=\"true\" class=\"absolute bg-white top-[100%] bottom-0 px-2 py-1 shadow-light rounded min-w-[16rem] z-10 h-fit inset-x-0\" id=\"quality-of-work\" aria-labelledby=\"toggle-button-quality-of-work\" style=\"display:none\">Quality work is a the overall excellence, accuracy, and completeness service provided.</span></span>&nbsp;<!-- -->and<!-- aria-controls=\"communication\" id=\"toggle-button-communication\" text-sm\">communication</b></button><span right-0 lg:inset-x-0\" id=\"communication\" aria-labelledby=\"toggle-button-communication\" style=\"display:none\">Communication partner's clarity, responsiveness, effectiveness in keeping touch throughout service.</span></span></p><div class=\"mt-3 flex\"><ol><li class=\"flex h-4 mb-2\"><span aria-description=\"5 star ratings\" id=\"5-label\" max-w-fit\"><div items-center\"><svg max-w-fit pl-1\" width=\"16\" height=\"16\" 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M3.19974 15.9999C3.03414 15.9999 2.86934 15.9487 2.73014 15.8479C2.49014 15.6735 2.36533 15.3808 2.40774 15.0864L3.15094 9.88332L0.234122 6.96581C0.0221212 6.75382 -0.0530793 6.44183 0.0381213 6.15624C0.129322 5.87065 0.372523 5.66025 0.667725 5.61146L5.06615 4.87788L7.28376 0.442814C7.42056 0.170023 7.72057 -0.00997163 8.00377 0.000428047C8.30857 0.002028 8.58537 0.176423 8.71897 0.450814L10.8422 4.81228L15.3398 5.61306C15.6334 5.66505 15.8734 5.87625 15.963 6.16024C16.0526 6.44503 15.9766 6.75542 15.7654 6.96581L12.8478 9.88332L13.5918 15.0864C13.6334 15.3824 13.5086 15.6767 13.2654 15.8503C13.023 16.0247 12.703 16.0479 12.4382 15.9135L8.05577 13.6944L3.55414 15.9167C3.44214 15.9727 3.32054 3.19974 15.9999Z\" fill=\"#F5C452\"></path></svg><svg fill=\"#F5C452\"></path></svg></div></span></li><li aria-description=\"4 id=\"4-label\" pl-1 pb-[2px]\" d=\"M4.5018 10.7966L1.24008 8.0967C0.624455 7.60443 0.894465 6.61448 1.67569 6.50289L6.30186 6.2968L8.27744 1.34437C8.34471 1.20982 8.44812 1.09667 8.57609 1.01758C8.70406 0.938496 8.85153 0.896606 9.00196 0.896606C9.1524 9.29987 9.42784 1.01758C9.5558 9.65922 9.72649 1.34437L11.7021 6.2968L16.3282 6.50289C17.1095 17.3795 16.7638 8.0967L13.5021 10.7966L14.3923 16.0676C14.4155 16.2301 14.3938 16.396 14.3295 16.5471C14.2653 16.6982 14.1609 16.8289 14.0276 16.9249C13.8944 17.021 13.7374 17.0787 13.5737 17.0919C13.41 17.1052 13.2458 17.0733 13.0989 16.9999L9.00196 14.3964L4.90501 16.999C4.7581 17.0724 4.5939 17.1043 4.43019 17.091C4.26649 17.0778 4.10952 17.0201 3.97629 16.924C3.84307 16.828 3.73866 16.6973 3.67439 16.5462C3.61012 16.3951 3.58843 16.2292 3.61167 16.0667L4.5018 10.7966Z\" fill=\"#D2D5D9\"></path></svg></div></span></li><li aria-description=\"3 id=\"3-label\" fill=\"#D2D5D9\"></path></svg><svg aria-description=\"2 id=\"2-label\" aria-description=\"1 id=\"1-label\" fill=\"#D2D5D9\"></path></svg></div></span></li></ol><ol class=\"flex-1 ml-6 mr-2 mt-[1px]\"><li aria-labelledby=\"5-label\" class=\"h-4 mb-2\"><div relative overflow-hidden rounded-md bg-gray-200 h-4\"><div top-0 bottom-10 left-0 bg-emerald-200 h-4\" style=\"padding-right:98.04421768707483%\"></div></div></li><li aria-labelledby=\"4-label\" style=\"padding-right:1.3605442176870748%\"></div></div></li><li aria-labelledby=\"3-label\" style=\"padding-right:0.17006802721088435%\"></div></div></li><li aria-labelledby=\"2-label\" style=\"padding-right:0%\"></div></div></li><li aria-labelledby=\"1-label\" style=\"padding-right:0.4251700680272109%\"></div></div></li></ol><ol class=\"mt-[-6px]\"><li class=\"\"><span aria-labelledby=\"5-label text-left\" class=\"text-gray-400 text-[14px] leading-[14px]\">(<!-- -->1153<!-- -->)</span></li><li aria-labelledby=\"4-label leading-[14px]\">(<!-- -->16<!-- -->)</span></li><li aria-labelledby=\"3-label leading-[14px]\">(<!-- -->2<!-- -->)</span></li><li aria-labelledby=\"2-label leading-[14px]\">(<!-- -->0<!-- -->)</span></li><li aria-labelledby=\"1-label leading-[14px]\">(<!-- -->5<!-- -->)</span></li></ol></div></div>">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Reviews</h2>
            <ReviewSection partnerId={id} onReviewAdded={handleReviewAdded} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {partner &&
      <>
          <ContactModal partner={partner} isOpen={contactOpen} onClose={() => setContactOpen(false)} mode="inquiry" />
          <ContactModal partner={partner} isOpen={hireOpen} onClose={() => setHireOpen(false)} mode="hire" />
          <FlagModal partner={partner} isOpen={flagOpen} onClose={() => setFlagOpen(false)} />
        </>
      }
    </div>);

}