import React from 'react';
import { Quote, Star } from 'lucide-react';

export default function TestimonialsScroller({ testimonials = [] }) {
  if (!testimonials.length) return null;

  const items = testimonials.filter((t) => t.text);
  if (!items.length) return null;

  // Duplicate the list for a seamless loop
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent" />

      <div className="flex gap-4 animate-testimonials-marquee w-max hover:[animation-play-state:paused]">
        {loop.map((t, idx) => (
          <div
            key={idx}
            className="w-72 sm:w-80 shrink-0 bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {t.image_url ? (
                <img src={t.image_url} alt={t.author_name || 'Client'} className="w-10 h-10 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {(t.author_name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{t.author_name || 'Client'}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3" style={{ fill: '#FFC107', color: '#FFC107' }} />
                  ))}
                </div>
              </div>
              <Quote className="w-5 h-5 text-primary/30 ml-auto shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}