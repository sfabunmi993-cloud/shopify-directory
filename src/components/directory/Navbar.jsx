import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ChevronDown, LogOut, User, LayoutDashboard, Heart, MessageSquare, ShieldCheck, Inbox } from 'lucide-react';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPartnerProfile, setHasPartnerProfile] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [partnerLogo, setPartnerLogo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Always enforce light mode
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');

    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        setIsAdmin(me.role === 'admin');
        const partners = await base44.entities.Partner.filter({ created_by_id: me.id });
        if (partners.length > 0) {
          setHasPartnerProfile(true);
          setPartnerId(partners[0].id);
          setPartnerLogo(partners[0].logo_url || null);
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

  const serviceCategories = [
  { label: 'Marketing and sales', to: '/directory?category=marketing_and_sales' },
  { label: 'Store setup and management', to: '/directory?category=store_setup_and_management' },
  { label: 'Development and troubleshooting', to: '/directory?category=development_and_troubleshooting' },
  { label: 'Visual content and branding', to: '/directory?category=visual_content_and_branding' },
  { label: 'Content writing', to: '/directory?category=content_writing' },
  { label: 'Expert guidance', to: '/directory?category=expert_guidance' }];


  const locations = [
  { label: 'United States', to: '/directory?country=United States' },
  { label: 'Canada', to: '/directory?country=Canada' },
  { label: 'India', to: '/directory?country=India' },
  { label: 'United Kingdom', to: '/directory?country=United Kingdom' },
  { label: 'Australia', to: '/directory?country=Australia' },
  { label: 'Germany', to: '/directory?country=Germany' },
  { label: 'France', to: '/directory?country=France' },
  { label: 'Italy', to: '/directory?country=Italy' }];


  return (
    <header className="sticky top-0 z-50 bg-white text-black border-y border-black/20 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-gray-200">
        <div className="flex items-center h-12 gap-4">
          {/* Logo */}
          <a href="https://www.shopify.com/ng/partners" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 shrink-0">
            <img src="https://cdn.shopify.com/b/shopify-brochure2-assets/08b278c519512d187520e1fe10b4f5b7.svg" alt="Shopify" className="h-7" />
          </a>

          {/* Secondary nav — desktop */}
          <nav aria-label="Secondary" className="hidden lg:flex items-center gap-x-8 h-full">
            {/* About */}
            <Link to="/about" className="flex items-center h-full text-sm font-medium hover:underline">
              About
            </Link>

            {/* Browse */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center h-full text-sm font-medium hover:underline">
                  Browse <ChevronDown className="w-4 h-4 ml-1.5 rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuItem asChild>
                  <Link to="/directory" className="flex flex-col">
                    <span>Service partners</span>
                    <span className="text-gray-500 text-xs">Hire a professional</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/directory" className="flex flex-col">
                    <span>Technology solutions</span>
                    <span className="text-gray-500 text-xs">Use apps or pre-built software integrations</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Services */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center h-full text-sm font-medium hover:underline">
                  Services <ChevronDown className="w-4 h-4 ml-1.5 rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {serviceCategories.map((c) =>
                <DropdownMenuItem asChild key={c.label}>
                    <Link to={c.to}>{c.label}</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Locations */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center h-full text-sm font-medium hover:underline">
                  Locations <ChevronDown className="w-4 h-4 ml-1.5 rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                {locations.map((l) =>
                <DropdownMenuItem asChild key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/directory">View all partner locations</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by keyword, service, partner name, or country"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 rounded-full bg-white border-gray-300 text-black placeholder:text-gray-400" />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* About us — desktop */}
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex text-black hover:bg-black/5">
              
            </Button>

            {/* Contact us — desktop */}
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex text-black hover:bg-black/5">
              <Link to="/contact">Contact us</Link>
            </Button>

            {user ?
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center hover:opacity-80 transition-opacity p-1 -m-1 text-black rounded-full ring-2 ring-black/10 hover:ring-black/20">
                    <Avatar className="w-8 h-8">
                      {partnerLogo ?
                    <AvatarImage src={partnerLogo} alt={user.full_name || 'Account'} /> :
                    user?.picture && <AvatarImage src={user.picture} alt={user.full_name || 'Profile'} />}
                      <AvatarFallback className="bg-black/10 text-black text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  {hasPartnerProfile ?
                <>
                      <DropdownMenuItem asChild>
                        <Link to="/my-profile"><User className="w-4 h-4 mr-2" /> My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/partner/${partnerId}`}><LayoutDashboard className="w-4 h-4 mr-2" /> View Public Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/favorites"><Heart className="w-4 h-4 mr-2" /> Saved Partners</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/messages"><MessageSquare className="w-4 h-4 mr-2" /> Messages</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/private-messages"><Inbox className="w-4 h-4 mr-2" /> Private Messages</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </> :

                <>
                      <DropdownMenuItem asChild>
                        <Link to="/become-a-partner"><User className="w-4 h-4 mr-2" /> Become a Partner</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/favorites"><Heart className="w-4 h-4 mr-2" /> Saved Partners</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/messages"><MessageSquare className="w-4 h-4 mr-2" /> Messages</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/private-messages"><Inbox className="w-4 h-4 mr-2" /> Private Messages</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                }
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> :

            <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-black hover:bg-black/5">
                  <a href="https://www.shopify.com/" target="_blank" rel="noopener noreferrer">Log in</a>
                </Button>
                <Button asChild size="sm" className="rounded-full bg-black text-white hover:bg-black/90">
                  <Link to="/register">Login </Link>
                </Button>
              </div>
            }

            {/* Mobile: Become a Partner */}
            {!user &&
            <div className="md:hidden flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-black/60 leading-none">Are you a partner?</span>
                <Button asChild size="sm" className="rounded-full bg-black text-white hover:bg-black/90 h-7 px-3 text-xs">
                  <Link to="/register">Login as an expert</Link>
                </Button>
              </div>
            }

            {/* Mobile: hamburger */}
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors text-black lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : null}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={(e) => {handleSearch(e);setMobileMenuOpen(false);}}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-white border-gray-300 text-black" />
            </div>
          </form>
        </div>

        {/* Mobile menu side drawer */}
        {mobileMenuOpen &&
        <div className="lg:hidden fixed inset-0 z-[60]" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/40"></div>
            <div
            className="absolute right-0 top-0 h-full w-64 max-w-[80vw] bg-white shadow-xl overflow-y-auto px-3 space-y-1 py-3"
            onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-sm font-semibold text-black">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded hover:bg-black/5">
                    <X className="w-5 h-5 text-black" />
                  </button>
                </div>
                {user &&
            <div className="flex items-center gap-3 px-2 py-2 mb-1 bg-black/5 rounded-xl">
                    <Avatar className="w-9 h-9">
                      {user?.picture && <AvatarImage src={user.picture} alt={user.full_name || 'Profile'} />}
                      <AvatarFallback className="bg-black/10 text-black text-sm font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-black">{user.full_name || 'Account'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
            }
                {user &&
            <div className="px-2 mb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Quick access</p>
                    <MobileLink to="/favorites" onClick={() => setMobileMenuOpen(false)} icon={Heart}>Saved Partners</MobileLink>
                    <MobileLink to="/messages" onClick={() => setMobileMenuOpen(false)} icon={MessageSquare}>Messages</MobileLink>
                    <MobileLink to="/private-messages" onClick={() => setMobileMenuOpen(false)} icon={Inbox}>Private Messages</MobileLink>
                  </div>
            }
                <div className="pt-2 mt-1 border-t border-black/10 px-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1 mt-1">Browse</p>
                </div>
                <MobileLink to="/directory" onClick={() => setMobileMenuOpen(false)}>Browse All</MobileLink>
                {serviceCategories.map((c) =>
            <MobileLink key={c.label} to={c.to} onClick={() => setMobileMenuOpen(false)}>{c.label}</MobileLink>
            )}
                <MobileLink to="/about" onClick={() => setMobileMenuOpen(false)}>About us</MobileLink>
                <MobileLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact us</MobileLink>
                {user ?
            <>
                    {isAdmin && <MobileLink to="/admin" onClick={() => setMobileMenuOpen(false)} highlight>Admin Dashboard</MobileLink>}
                    {hasPartnerProfile ?
              <>
                        <MobileLink to="/my-profile" onClick={() => setMobileMenuOpen(false)}>My Profile</MobileLink>
                        <MobileLink to={`/partner/${partnerId}`} onClick={() => setMobileMenuOpen(false)}>View Public Profile</MobileLink>
                      </> :

              <MobileLink to="/become-a-partner" onClick={() => setMobileMenuOpen(false)}>Become a Partner</MobileLink>
              }
                    <div className="pt-2 mt-1 border-t border-black/10">
                      <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                        Log out
                      </button>
                    </div>
                  </> :

            <div className="flex flex-col gap-2 pt-2">
                    <Button asChild variant="outline" className="w-full rounded-full border-black/20 text-black">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                    </Button>
                    <Button asChild className="w-full rounded-full bg-black text-white hover:bg-black/90">
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Login as an expert</Link>
                    </Button>
                  </div>
            }
              </div>
          </div>
        }
      </div>
    </header>);

}

function MobileLink({ to, onClick, children, highlight, icon: Icon }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors hover:bg-black/5 text-black ${highlight ? 'text-primary' : ''}`}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="truncate">{children}</span>
    </Link>);
}