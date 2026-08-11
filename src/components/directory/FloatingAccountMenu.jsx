import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Heart, MessageSquare, ShieldCheck, Inbox } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function FloatingAccountMenu() {
  const [user, setUser] = useState(null);
  const [hasPartnerProfile, setHasPartnerProfile] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [partnerLogo, setPartnerLogo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) return;
      const me = await base44.auth.me();
      setUser(me);
      setIsAdmin(me.role === 'admin');
      const partners = await base44.entities.Partner.filter({ created_by_id: me.id });
      if (partners.length > 0) {
        setHasPartnerProfile(true);
        setPartnerId(partners[0].id);
        setPartnerLogo(partners[0].logo_url || null);
      }
    });
  }, []);

  const handleLogout = () => base44.auth.logout('/');

  if (!user) return null;

  const initials = user.full_name ?
  user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() :
  user.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="fixed top-2 right-3 z-[55]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center hover:opacity-80 transition-opacity rounded-full ring-2 ring-black/10 hover:ring-black/20 bg-white shadow-sm py-1 px-2 my-8">
            <Avatar className="w-9 h-9">
              {partnerLogo ?
              <AvatarImage src={partnerLogo} alt={user.full_name || 'Account'} /> :

              user?.picture && <AvatarImage src={user.picture} alt={user.full_name || 'Profile'} />
              }
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
      </DropdownMenu>
    </div>);

}