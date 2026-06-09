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
            <span className="font-heading font-bold text-lg text-foreground hidden sm:block">Shopify Partners Directory</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search partners, services, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-full border-border bg-muted/50 focus:bg-white" />
              
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