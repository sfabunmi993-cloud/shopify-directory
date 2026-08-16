import React from 'react';
import { Quote, Star } from 'lucide-react';

export default function TestimonialsScroller({ testimonials = [] }) {
  const items = (testimonials || []).filter((t) => t.text);
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((t, idx) => (
        <div
          key={idx}
          className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
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
          <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
        </div>
      ))}
    </div>
  );
}