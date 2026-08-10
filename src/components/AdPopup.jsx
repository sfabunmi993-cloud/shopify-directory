import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function AdPopup() {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const shownCountRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return;
        const me = await base44.auth.me();
        // Only show the ad popup to experts (users with a partner profile)
        const partners = await base44.entities.Partner.filter({ created_by_id: me.id });
        if (partners.length === 0) return;

        const ads = await base44.entities.AdPromotion.filter({ is_active: true });
        if (ads.length > 0) {
          setAd(ads[0]);
          // Show the ad for the first time shortly after login.
          setTimeout(() => setVisible(true), 2000);
        }
      } catch (_) {}
    };

    load();
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible || !ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: ad.bg_color || '#ffffff' }}>
        
        {/* Close X */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          style={{ color: ad.text_color || '#111' }}>
          
          <X className="w-4 h-4" />
        </button>

        {/* Video or Image */}
        {ad.video_url ?
        <video
          src={ad.video_url}
          controls
          autoPlay
          className="w-full my-8"
          style={{ maxHeight: 300 }} /> :

        ad.image_url ?
        <img
          src={ad.image_url}
          alt="Promotion"
          className="w-full"
          style={{ maxHeight: 300, objectFit: 'contain' }}
          onError={(e) => e.target.style.display = 'none'} /> :

        null}

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold leading-tight" style={{ color: ad.text_color || '#111' }}>
            {ad.title}
          </h2>
          {ad.content &&
          <p className="mt-2 text-sm leading-relaxed opacity-80" style={{ color: ad.text_color || '#111' }}>
              {ad.content}
            </p>
          }

          <div className="flex gap-3 mt-5">
            <button
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ad.button_color || '#166534' }}
              onClick={() => {dismiss();navigate(`/ad?id=${ad.id}`);}}>
              
              {ad.button_text || 'Learn More'}
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-black/5"
              style={{ color: ad.text_color || '#111', borderColor: `${ad.text_color || '#111'}33` }}>
              
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>);

}