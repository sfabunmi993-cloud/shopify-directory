import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Heart, MessageSquare, ShieldCheck, Sun, Moon } from 'lucide-react';
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

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return false; // default to light mode
  });

  useEffect(() => {
    const root = document.documentElement;
    // Always start by removing dark, then add only if needed
    root.classList.remove('dark');
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return [dark, setDark];
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPartnerProfile, setHasPartnerProfile] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dark, setDark] = useDarkMode();
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
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & tablet row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="https://cdn.shopify.com/b/shopify-brochure2-assets/08b278c519512d187520e1fe10b4f5b7.svg" alt="Shopify" className="h-6" />
            <span className="font-heading font-bold text-base text-foreground hidden lg:block">Shopify Partners Directory</span>
          </Link>

          {/* Search — hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              
              




              
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ?
            <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold opacity-100">{initials}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
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
                        <DropdownMenuSeparator />
                      </> :

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
              </div>
            }
          </nav>

          {/* Mobile: dark toggle + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-full hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar — always visible on mobile below the top row */}
        <div className="md:hidden pb-3">
          <form onSubmit={(e) => {handleSearch(e);setMobileMenuOpen(false);}}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-muted/50" />
            </div>
          </form>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen &&
        <div className="md:hidden border-t border-border py-4 space-y-1">
            {user &&
          <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-muted/40 rounded-xl">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.full_name || 'Account'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
          }
            <MobileLink to="/directory" onClick={() => setMobileMenuOpen(false)}>Browse All</MobileLink>
            <MobileLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileLink>
            <MobileLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileLink>
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
                <MobileLink to="/favorites" onClick={() => setMobileMenuOpen(false)}>Saved Partners</MobileLink>
                <MobileLink to="/messages" onClick={() => setMobileMenuOpen(false)}>Messages</MobileLink>
                <div className="pt-2 mt-2 border-t border-border">
                  <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                
                    Log out
                  </button>
                </div>
              </> :

          <div className="flex flex-col gap-2 pt-2">
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                </Button>
                <Button asChild className="w-full rounded-full">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Become a Partner</Link>
                </Button>
              </div>
          }
          </div>
        }
      </div>
    </header>);

}

function MobileLink({ to, onClick, children, highlight }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-muted hidden ${highlight ? 'text-primary' : 'text-foreground'}`}>
      
      {children}
    </Link>);

}