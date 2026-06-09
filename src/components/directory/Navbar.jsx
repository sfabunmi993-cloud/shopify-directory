import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Heart, MessageSquare, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPartnerProfile, setHasPartnerProfile] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        setIsAdmin(me.role === 'admin');
        const partners = await base44.entities.Partner.filter({ created_by_id: me.id });
        if (partners.length > 0) {
          setHasPartnerProfile(true);
          setPartnerId(partners[0].id);
        }
      }
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const initials = user?.full_name ?
  user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() :
  user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="https://cdn.shopify.com/b/shopify-brochure2-assets/08b278c519512d187520e1fe10b4f5b7.svg" alt="Shopify" className="h-7" />
            
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search partners, services, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="<div class=\"fixed top-global-header z-20 before:absolute before:top-0 before:left-0 before:pointer-events-none before:w-full before:h-global-header-with-border before:z-20 after:absolute after:top-0 after:left-0 after:will-change-[opacity] after:pointer-events-none after:h-full after:w-full after:z-10 after:transition-opacity after:duration-200 after:bg-white text-black before:border-y before:border-black/20 after:opacity-0 pointer-events-auto before:opacity-100\"><div class=\"h-global-header container items-center relative z-20\"><div class=\"flex h-14 sm:h-global-header box-border text-black\"><div class=\"hidden mr-8\"><a href=\"/\" data-component-name=\"logo-home\" class=\"inline-block shrink-0\"><img src=\"https://cdn.shopify.com/b/shopify-brochure2-assets/cac815e4ee0f383f7b4b5302b5a7a29a.svg\" alt=\"Shopify\" class=\"w-8 h-9\" data-component-name=\"shopify-logo\"></a></div><nav aria-label=\"Secondary\" lg:block h-full\" data-click-outside=\"dismiss\"><ul gap-x-8 h-full\"><li class=\"relative flex-col h-full after:h-[3px] after:bottom-0 hover:underline after:hidden after:bg-black\"><button type=\"button\" aria-expanded=\"false\" aria-controls=\"id_Browse_0\" class=\"h-full outline-state-focus outline-4 focus-visible:outline\" data-secondary-nav-tier=\"1\"><span items-center\">Browse<svg fill=\"none\" viewBox=\"0 0 20 20\" aria-hidden=\"true\" icon=\"chevron\" height=\"64\" width=\"64\" class=\"rotate-180 shrink-0 w-5 h-7 ml-2\"><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m4 13 6-6 6 6\"></path></svg></span></button><div id=\"id_Browse_0\" class=\"absolute top-[80px] duration-500 left-0 rounded-lg whitespace-nowrap transition-all box-content bg-white shadow-light sr-only opacity-0 -translate-y-6\"><ul class=\"p-4 w-[240px] box-content\"><li class=\"py-3 px-4 rounded-lg\"><a href=\"/partners/directory/services\" class=\"hover:underline focus-visible:outline break-normal whitespace-normal text-left\" data-secondary-nav-tier=\"2\"><div flex-col\"><span>Service partners</span><span class=\"text-gray-500 text-sm\">Hire a professional</span></div></a></li><li href=\"/partners/directory/technologies\" flex-col\"><span>Technology solutions</span><span text-sm\">Use apps or pre-built software integrations</span></div></a></li></ul></div></li><li aria-controls=\"id_Services_1\" items-center\">Services<svg id=\"id_Services_1\" rounded-lg\"><button aria-controls=\"id_Marketing and sales_0\" class=\"w-full data-secondary-nav-tier=\"2\"><span text-left\">Marketing sales<svg class=\"rotate-90 ml-auto\"><path top-[-1px] bottom-0 left-1/2 w-[256px] p-4 px-0 pointer-events-none\" id=\"id_Marketing sales_0\"><ul class=\"w-[224px] border-l transition-opacity delay-150 border-shade-30\"><li px-4\"><a href=\"/partners/directory/services/marketing-and-sales/email-marketing\" data-secondary-nav-tier=\"3\">Email marketing</a></li><li href=\"/partners/directory/services/marketing-and-sales/seo-and-paid-search\" data-secondary-nav-tier=\"3\">SEO</a></li><li href=\"/partners/directory/services/marketing-and-sales/setup-search-engine-advertising-campaigns\" data-secondary-nav-tier=\"3\">Search engine advertising</a></li><li href=\"/partners/directory/services/marketing-and-sales/social-media-marketing\" data-secondary-nav-tier=\"3\">Social media href=\"/partners/directory/services/marketing-and-sales/content-marketing\" data-secondary-nav-tier=\"3\">Content href=\"/partners/directory/services/marketing-and-sales/sales-channel-setup\" data-secondary-nav-tier=\"3\">Sales channel setup</a></li><li href=\"/partners/directory/services/marketing-and-sales/conversion-rate-optimization\" data-secondary-nav-tier=\"3\">Conversion rate optimization</a></li><li href=\"/partners/directory/services/marketing-and-sales/analytics-and-tracking\" data-secondary-nav-tier=\"3\">Analytics tracking</a></li></ul></div></li><li aria-controls=\"id_Store setup management_1\" text-left\">Store management<svg id=\"id_Store management_1\"><ul href=\"/partners/directory/services/store-setup/customize-design\" data-secondary-nav-tier=\"3\">Store build redesign</a></li><li href=\"/partners/directory/services/store-setup/migrate-from-another-platform\" migration</a></li><li href=\"/partners/directory/services/store-setup/set-up-products-and-collections\" data-secondary-nav-tier=\"3\">Product collection href=\"/partners/directory/services/store-setup/customize-theme\" data-secondary-nav-tier=\"3\">Theme customization</a></li><li href=\"/partners/directory/services/store-setup/configure-settings\" settings configuration</a></li><li href=\"/partners/directory/services/store-setup/pos-setup-and-migration\" data-secondary-nav-tier=\"3\">POS href=\"/partners/directory/services/store-setup/headless-commerce\" data-secondary-nav-tier=\"3\">Headless commerce</a></li><li href=\"/partners/directory/services/store-setup/website-audit-and-optimization-strategy\" data-secondary-nav-tier=\"3\">Website audit optimization strategy</a></li><li href=\"/partners/directory/services/store-setup/ongoing-website-management\" data-secondary-nav-tier=\"3\">Ongoing website management</a></li><li href=\"/partners/directory/services/store-setup/checkout-upgrade\" data-secondary-nav-tier=\"3\">Checkout upgrade</a></li></ul></div></li><li aria-controls=\"id_Development troubleshooting_2\" text-left\">Development troubleshooting<svg id=\"id_Development troubleshooting_2\"><ul href=\"/partners/directory/services/development-and-troubleshooting/custom-apps-integrations\" data-secondary-nav-tier=\"3\">Custom integrations</a></li><li href=\"/partners/directory/services/development-and-troubleshooting/domain-setup\" domain href=\"/partners/directory/services/development-and-troubleshooting/troubleshooting-and-problem-resolution\" data-secondary-nav-tier=\"3\">Troubleshooting</a></li><li href=\"/partners/directory/services/development-and-troubleshooting/systems-integration\" data-secondary-nav-tier=\"3\">Systems integration</a></li></ul></div></li><li aria-controls=\"id_Visual content branding_3\" text-left\">Visual branding<svg id=\"id_Visual branding_3\"><ul href=\"/partners/directory/services/visual-content-and-branding/develop-brand-look-and-feel\" data-secondary-nav-tier=\"3\">Logo visual branding</a></li><li href=\"/partners/directory/services/visual-content-and-branding/create-custom-banner-ads\" data-secondary-nav-tier=\"3\">Banner ads</a></li><li href=\"/partners/directory/services/visual-content-and-branding/video-and-illustrations\" data-secondary-nav-tier=\"3\">Video illustrations</a></li><li href=\"/partners/directory/services/visual-content-and-branding/take-product-photos\" photography</a></li><li href=\"/partners/directory/services/visual-content-and-branding/create-3d-models-ar\" data-secondary-nav-tier=\"3\">3D modelling</a></li></ul></div></li><li aria-controls=\"id_Content writing_4\" text-left\">Content writing<svg id=\"id_Content writing_4\"><ul href=\"/partners/directory/services/content-writing/write-product-descriptions\" descriptions</a></li><li href=\"/partners/directory/services/content-writing/website-marketing-content\" marketing content</a></li></ul></div></li><li aria-controls=\"id_Expert guidance_5\" text-left\">Expert guidance<svg id=\"id_Expert guidance_5\"><ul href=\"/partners/directory/services/expert-guidance/business-strategy-guidance\" data-secondary-nav-tier=\"3\">Business strategy guidance</a></li><li href=\"/partners/directory/services/expert-guidance/product-sourcing-guidance\" sourcing href=\"/partners/directory/services/expert-guidance/guidance-for-improving-your-site-performance-and-speed\" data-secondary-nav-tier=\"3\">Site performance speed</a></li><li href=\"/partners/directory/services/expert-guidance/tax-setup\" tax href=\"/partners/directory/services/expert-guidance/wholesale-or-b2b\" data-secondary-nav-tier=\"3\">Wholesale/B2B</a></li><li href=\"/partners/directory/services/expert-guidance/international-expansion\" data-secondary-nav-tier=\"3\">International expansion</a></li><li href=\"/partners/directory/services/expert-guidance/product-development\" development</a></li></ul></div></li></ul></div></li><li aria-controls=\"id_Locations_2\" items-center\">Locations<svg id=\"id_Locations_2\" href=\"/partners/directory/locations/united-states\" flex-col\"><span>United States</span></div></a></li><li href=\"/partners/directory/locations/canada\" flex-col\"><span>Canada</span></div></a></li><li href=\"/partners/directory/locations/india\" flex-col\"><span>India</span></div></a></li><li href=\"/partners/directory/locations/united-kingdom\" Kingdom</span></div></a></li><li href=\"/partners/directory/locations/australia\" flex-col\"><span>Australia</span></div></a></li><li href=\"/partners/directory/locations/germany\" flex-col\"><span>Germany</span></div></a></li><li href=\"/partners/directory/locations/france\" flex-col\"><span>France</span></div></a></li><li href=\"/partners/directory/locations/italy\" flex-col\"><span>Italy</span></div></a></li><li href=\"/partners/directory/locations\" flex-col\"><span>View all partner locations</span></div></a></li></ul></div></li></ul></nav><div flex-1\"></div><nav class=\"lg:hidden z-10\" data-click-outside=\"dismiss\"><button aria-haspopup=\"true\" text-body-base text-left leading-[44px] -outline-offset-4 overflow-hidden\"><span gap-y-1 truncate transition-transform duration-200 will-change-transform translate-x-0\"><span class=\"text-body-sm opacity-60 font-bold uppercase leading-4\">Partner Directory</span><span class=\"text-lg leading-5\" data-nosnippet=\"true\">Profile</span></span><svg 6\"></path></svg></button><div id=\"id_mobile_secondary_nav\" right-0 max-h-[calc(100dvh-14rem)] p-6 overflow-y-scroll transition-opacity-transform translate-y-full pointer-events-none shadow-light\"><ul gap-y-6\"><li class=\"pb-6 border-b text-body-lg leading-4 border-shade-30\"><a href=\"/partners/directory\">Overview</a></li><li gap-y-6 pb-6 last:pb-0 last:border-b-0 border-shade-30\"><span class=\"font-bold text-body-sm text-shade-60\">Browse</span><ul class=\"gap-6 grid grid-cols-1 sm:grid-cols-2\"><li gap-y-6\"><span text-lg leading-[20px]\"><a class=\"text-body-lg data-secondary-nav-tier=\"2\">Service partners</a></span></li><li data-secondary-nav-tier=\"2\">Technology solutions</a></span></li></ul></li><li text-shade-60\">Services</span><ul leading-[20px]\"><button my-[-10px] w-full\">Marketing 6\"></path></svg></span></button><ul pl-6 border-shade-30 hidden\" data-active=\"false\" sales_0_mobile\"><li><a class=\"text-body-base font-medium marketing</a></li><li><a data-secondary-nav-tier=\"3\">SEO</a></li><li><a advertising</a></li><li><a setup</a></li><li><a optimization</a></li><li><a tracking</a></li></ul></span></li><li w-full\">Store management_1_mobile\"><li><a redesign</a></li><li><a migration</a></li><li><a customization</a></li><li><a configuration</a></li><li><a commerce</a></li><li><a strategy</a></li><li><a management</a></li><li><a upgrade</a></li></ul></span></li><li w-full\">Development troubleshooting_2_mobile\"><li><a integrations</a></li><li><a data-secondary-nav-tier=\"3\">Troubleshooting</a></li><li><a integration</a></li></ul></span></li><li w-full\">Visual branding_3_mobile\"><li><a branding</a></li><li><a ads</a></li><li><a illustrations</a></li><li><a photography</a></li><li><a modelling</a></li></ul></span></li><li w-full\">Content writing_4_mobile\"><li><a descriptions</a></li><li><a content</a></li></ul></span></li><li w-full\">Expert guidance_5_mobile\"><li><a guidance</a></li><li><a speed</a></li><li><a data-secondary-nav-tier=\"3\">Wholesale/B2B</a></li><li><a expansion</a></li><li><a development</a></li></ul></span></li></ul></li><li text-shade-60\">Locations</span><ul data-secondary-nav-tier=\"2\">United States</a></span></li><li data-secondary-nav-tier=\"2\">Canada</a></span></li><li data-secondary-nav-tier=\"2\">India</a></span></li><li Kingdom</a></span></li><li data-secondary-nav-tier=\"2\">Australia</a></span></li><li data-secondary-nav-tier=\"2\">Germany</a></span></li><li data-secondary-nav-tier=\"2\">France</a></span></li><li data-secondary-nav-tier=\"2\">Italy</a></span></li><li data-secondary-nav-tier=\"2\">View locations</a></span></li></ul></li></ul></div></nav><div class=\"hidden\"><ul><li class=\"text-base\"><a class=\"whitespace-nowrap text-black\" data-component-name=\"browse-partners\"></a></li></ul></div><div class=\"text-base items-center\"><a href=\"/services/auth/login?return_to=https%3A%2F%2Fwww.shopify.com%2Fpartners%2Fdirectory%2Fpartner%2Fadam-shrum\" self-center overflow-hidden max-w-full px-button-px py-button-py ring-inset rounded-button text-button-size font-button-font font-button-weight tracking-button-tracking duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-state-focus border-2 text-button-light-primary-text bg-button-light-primary-bg border-button-light-primary-border ring-button-light-primary-border hover:text-button-light-primary-text-hover hover:bg-button-light-primary-bg-hover hover:border-button-light-primary-border-hover hover:ring-button-light-primary-border-hover focus:text-button-light-primary-text-focus focus:bg-button-light-primary-bg-focus focus:border-button-light-primary-border-focus focus:ring-button-light-primary-border-focus active:text-button-light-primary-text-active active:bg-button-light-primary-bg-active active:border-button-light-primary-border-active active:ring disabled:text-button-light-primary-text-disabled disabled:bg-button-light-primary-bg-disabled disabled:border-button-light-primary-border-disabled disabled:ring-button-light-primary-border-disabled\" data-component-name=\"partners-login\" target=\"\">Log in</a></li></ul></div></div></div></div>" />
              
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-4">
            <Link to="/directory" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>

            {user ?
            <>
                {!hasPartnerProfile &&
              <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/become-a-partner">Login</Link>
                  </Button>
              }
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium truncate">{user.full_name || 'Account'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin &&
                  <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin"><ShieldCheck className="w-4 h-4 mr-2" /> Admin Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                  }
                    {hasPartnerProfile &&
                  <>
                        <DropdownMenuItem asChild>
                          <Link to="/my-profile"><User className="w-4 h-4 mr-2" /> My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/partner/${partnerId}`}><LayoutDashboard className="w-4 h-4 mr-2" /> View Public Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                  }
                    {!hasPartnerProfile &&
                  <>
                        <DropdownMenuItem asChild>
                          <Link to="/become-a-partner"><User className="w-4 h-4 mr-2" /> Become a Partner</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                  }
                    <DropdownMenuItem asChild>
                      <Link to="/favorites"><Heart className="w-4 h-4 mr-2" /> Saved Partners</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages"><MessageSquare className="w-4 h-4 mr-2" /> Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> :

            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/register">Become a Partner</Link>
                </Button>
                {/* After register, user lands at /become-a-partner via onboarding */}
              </div>
            }
          </nav>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen &&
        <div className="md:hidden pb-4 border-t border-border pt-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                type="text"
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full" />
              
              </div>
            </form>
            <div className="flex flex-col gap-3">
              <Link to="/directory" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Browse All</Link>
              {user ?
            <>
                  {hasPartnerProfile ?
              <>
                      <Link to="/my-profile" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                      <Link to={`/partner/${partnerId}`} className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>View Public Profile</Link>
                    </> :

              <Link to="/become-a-partner" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Become a Partner</Link>
              }
                  <Link to="/favorites" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Saved Partners</Link>
                  <Link to="/messages" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
                  {isAdmin && <Link to="/admin" className="text-sm font-medium py-2 text-primary" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="text-sm font-medium py-2 text-destructive text-left">Log out</button>
                </> :

            <>
                  <Link to="/login" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                  <Button asChild size="sm" className="rounded-full w-fit">
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Become a Partner</Link>
                  </Button>
                </>
            }
            </div>
          </div>
        }
      </div>
    </header>);

}