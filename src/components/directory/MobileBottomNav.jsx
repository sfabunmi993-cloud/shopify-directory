import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, MessageSquare, Heart, User } from 'lucide-react';

const TABS = [
  { to: '/directory', label: 'Directory', icon: LayoutGrid },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/my-profile', label: 'Profile', icon: User },
];

function isNativeApp() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.cordova || window.Ionic) return true;
  const ua = window.navigator.userAgent || '';
  // iOS WKWebView (in-app) omits "Safari"
  if (/(iPhone|iPad|iPod)/i.test(ua) && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua)) return true;
  // Android WebView
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return true;
  if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true;
  return false;
}

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Per-tab sub-route history stacks so switching tabs restores the previous
  // view instead of clearing the stack.
  const tabHistoryRef = useRef(new Map());
  // Remembers the last active tab so non-tab sub-routes (e.g. /partner/:slug)
  // stay associated with the tab they were reached from.
  const lastTabRef = useRef('/');

  const isActive = (tab) => {
    if (tab.exact) return location.pathname === '/';
    return location.pathname === tab.to || location.pathname.startsWith(tab.to + '/');
  };

  const activeTab = TABS.find((t) => isActive(t));
  const currentBase = activeTab ? activeTab.to : lastTabRef.current;

  useEffect(() => {
    if (activeTab) lastTabRef.current = activeTab.to;
  }, [activeTab?.to]);

  // Only show the bottom nav inside the native mobile app; hide in all browsers
  if (!isNativeApp()) return null;

  const handleClick = (e, to) => {
    e.preventDefault();

    // Tapping the already-active tab jumps to its root while preserving the
    // history stack (back returns to the deeper view).
    if (currentBase === to) {
      if (location.pathname !== to) navigate(to);
      return;
    }

    // Leaving the current tab: remember the exact sub-route we were on.
    tabHistoryRef.current.set(currentBase, location.pathname);

    // Restoring the target tab's last sub-route if we have one; otherwise root.
    const saved = tabHistoryRef.current.get(to);
    const target = saved && saved !== location.pathname ? saved : to;
    if (target !== location.pathname) navigate(target);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border safe-pb select-none"
      aria-label="Primary mobile navigation"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = isActive({ to, exact: to === '/' });
          return (
            <a
              key={to}
              href={to}
              onClick={(e) => handleClick(e, to)}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-1.5 text-sm font-medium no-select ${
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