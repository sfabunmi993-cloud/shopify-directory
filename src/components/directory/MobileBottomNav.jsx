import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, MessageSquare, Heart, User } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/directory', label: 'Directory', icon: LayoutGrid },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/my-profile', label: 'Profile', icon: User },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (tab) => {
    if (tab.exact) return location.pathname === '/';
    return location.pathname === tab.to || location.pathname.startsWith(tab.to + '/');
  };

  const handleClick = (e, to) => {
    e.preventDefault();
    // Clicking the active tab resets its navigation history to root
    navigate(to, { replace: location.pathname === to });
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border safe-pb select-none"
      aria-label="Primary mobile navigation"
    >
      <div className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = isActive({ to, exact: to === '/' });
          return (
            <a
              key={to}
              href={to}
              onClick={(e) => handleClick(e, to)}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-1.5 text-[10px] font-medium no-select ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-primary/10' : ''}`} />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}