import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';

const SESSION_KEY = 'ad_popup_dismissed';

export default function AdPopup() {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed) return;

    const load = async () => {
      try {
        const ads = await base44.entities.AdPromotion.filter({ is_active: true });
        if (ads.length > 0) {
          setAd(ads[0]);
          setTimeout(() => setVisible(true), 2000);
        }
      } catch (_) {}
    };

    load();
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  if (!visible || !ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: ad.bg_color || '#ffffff' }}
      >
        {/* Close X */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          style={{ color: ad.text_color || '#111' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {ad.image_url && (
          <img
            src={ad.image_url}
            alt="Promotion"
            className="w-full h-52 object-cover"
            onError={e => e.target.style.display = 'none'}
          />
        )}

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold leading-tight" style={{ color: ad.text_color || '#111' }}>
            {ad.title}
          </h2>
          {ad.content && (
            <p className="mt-2 text-sm leading-relaxed opacity-80" style={{ color: ad.text_color || '#111' }}>
              {ad.content}
            </p>
          )}

          <div className="flex gap-3 mt-5">
            <a
              href={ad.button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ad.button_color || '#166534' }}
              onClick={dismiss}
            >
              {ad.button_text || 'Learn More'}
            </a>
            <button
              onClick={dismiss}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-black/5"
              style={{ color: ad.text_color || '#111', borderColor: `${ad.text_color || '#111'}33` }}
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}