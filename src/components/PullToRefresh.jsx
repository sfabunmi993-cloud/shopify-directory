import React, { useEffect, useRef, useState } from 'react';

export default function PullToRefresh({ onRefresh, scrollRef, threshold = 60 }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const distRef = useRef(0);
  const pullingRef = useRef(false);

  useEffect(() => {
    const getTarget = () => scrollRef?.current || window;
    const getScrollTop = () => {
      if (scrollRef?.current) return scrollRef.current.scrollTop;
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    const onStart = (e) => {
      if (refreshing) return;
      if (getScrollTop() > 0) {
        pullingRef.current = false;
        return;
      }
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
      distRef.current = 0;
    };

    const onMove = (e) => {
      if (!pullingRef.current || refreshing) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy <= 0) {
        distRef.current = 0;
        setPull(0);
        return;
      }
      if (getScrollTop() <= 0) {
        e.preventDefault();
        const d = Math.min(dy * 0.5, 90);
        distRef.current = d;
        setPull(d);
      } else {
        pullingRef.current = false;
        distRef.current = 0;
        setPull(0);
      }
    };

    const onEnd = () => {
      if (!pullingRef.current) {
        setPull(0);
        return;
      }
      pullingRef.current = false;
      if (distRef.current > threshold) {
        setRefreshing(true);
        setPull(threshold);
      } else {
        setPull(0);
      }
      distRef.current = 0;
    };

    const target = getTarget();
    target.addEventListener('touchstart', onStart, { passive: true });
    target.addEventListener('touchmove', onMove, { passive: false });
    target.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      target.removeEventListener('touchstart', onStart);
      target.removeEventListener('touchmove', onMove);
      target.removeEventListener('touchend', onEnd);
    };
  }, [scrollRef, refreshing, threshold]);

  useEffect(() => {
    if (!refreshing) return;
    let active = true;
    (async () => {
      try {
        await onRefresh?.();
      } finally {
        if (active) {
          setRefreshing(false);
          setPull(0);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshing, onRefresh]);

  const visible = pull > 0 || refreshing;

  return (
    <div
      className="fixed left-1/2 z-50 pointer-events-none flex items-center justify-center transition-opacity"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        transform: `translate(-50%, ${pull}px)`,
        opacity: visible ? 1 : 0,
      }}
      aria-hidden={!visible}
    >
      <div
        className={`w-8 h-8 rounded-full border-2 border-primary border-t-transparent ${
          refreshing ? 'animate-spin' : ''
        }`}
      />
    </div>
  );
}