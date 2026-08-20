import React, { useState } from 'react';
import { Globe, Pause, Play } from 'lucide-react';
import PortfolioItemReview from '@/components/directory/PortfolioItemReview';

export default function PortfolioScroller({ portfolio = [], partnerId }) {
  const items = (portfolio || []).filter((p) => p && p.url);
  const [paused, setPaused] = useState(false);
  if (!items.length) return null;

  // Duplicate for a seamless loop
  const loop = [...items, ...items];

  const faviconFor = (url) =>
    `https://www.google.com/s2/favicons?domain=${url.replace(/^https?:\/\//, '').split('/')[0]}&sz=64`;

  const domainLabel = (url) => url.replace(/^https?:\/\//, '').split('/')[0];

  return (
    <div className="relative overflow-hidden h-80">
      {/* fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent" />

      <button
        onClick={() => setPaused((p) => !p)}
        className="absolute top-2 right-2 z-20 bg-white/90 border border-border rounded-full p-1.5 shadow-sm hover:bg-white"
        title={paused ? 'Play animation' : 'Pause animation'}
        aria-label={paused ? 'Play animation' : 'Pause animation'}
      >
        {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </button>

      <div className={`flex gap-4 animate-testimonials-marquee w-max absolute top-0 left-0 ${paused ? '[animation-play-state:paused]' : 'hover:[animation-play-state:paused]'}`}>
        {loop.map((item, idx) => (
          <div
            key={idx}
            className="w-72 sm:w-80 shrink-0 bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-80">
            <div className="h-36 shrink-0 bg-muted">
              {item.type === 'video' ? (
                <video src={item.url} controls playsInline preload="metadata" className="w-full h-full object-contain bg-black" />
              ) : (
                <img src={item.url} alt={item.caption || 'Portfolio item'} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-3 space-y-2 flex-1 overflow-y-auto">
              {item.caption &&
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">{item.caption}</p>
              }
              {item.store_url &&
                <a
                  href={item.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  {item.store_name &&
                    <img src={faviconFor(item.store_url)} alt="" className="w-4 h-4 rounded-sm shrink-0" />
                  }
                  <span className="truncate">{item.store_name ? item.store_name : domainLabel(item.store_url)}</span>
                </a>
              }
              <PortfolioItemReview partnerId={partnerId} portfolioItemUrl={item.url} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}