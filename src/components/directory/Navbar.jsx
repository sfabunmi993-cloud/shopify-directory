import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ChevronDown, LogOut, Heart, MessageSquare, Inbox } from 'lucide-react';
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
import FloatingAccountMenu from './FloatingAccountMenu';
import NotificationsBell from './NotificationsBell';
import { partnerProfilePath } from '@/lib/partnerUrl';

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
    <header className="sticky top-0 z-50 bg-background text-foreground border-y border-border shadow-sm safe-pt">
      






























































































































































































































      
    </header>);

}

function MobileLink({ to, onClick, children, highlight, icon: Icon }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors hover:bg-accent text-foreground ${highlight ? 'text-primary' : ''}`}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="truncate">{children}</span>
    </Link>);
}