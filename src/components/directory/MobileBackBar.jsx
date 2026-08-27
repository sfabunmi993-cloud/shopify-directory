import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Root tab screens where the back bar is hidden (Home + the four primary tabs).
const ROOT_PATHS = ['/', '/directory', '/messages', '/favorites', '/my-profile'];

/**
 * Mobile/WebView-only top bar with a back button.
 *
 * Renders on every non-root route. Sticks just below the site <header>
 * (the Navbar) when one is present, otherwise at top:0 (e.g. auth screens).
 * Hidden on desktop and on the primary tab routes. Tapping back calls
 * navigate(-1).
 */
export default function MobileBackBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!isMobile) {
      setHeaderHeight(0);
      return;
    }
    const header = document.querySelector('header');
    if (!header) {
      setHeaderHeight(0);
      return;
    }
    const update = () => setHeaderHeight(header.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, [isMobile]);

  const isRoot = ROOT_PATHS.includes(location.pathname);
  if (!isMobile || isRoot) return null;

  // Only apply safe-area top padding when there is no Navbar above us.
  const needsSafeTop = headerHeight === 0;

  return (
    <div
      className={`sticky z-40 bg-background border-b border-border ${needsSafeTop ? 'safe-pt' : ''}`}
      style={{ top: headerHeight }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 h-11 px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors no-select min-h-[44px]"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
    </div>
  );
}