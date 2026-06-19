import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdDetail() {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get ad_id from query param
  const adId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    if (!adId) { setLoading(false); return; }
    base44.entities.AdPromotion.filter({ is_active: true }).then(ads => {
      const found = ads.find(a => a.id === adId) || ads[0];
      setAd(found || null);
      setLoading(false);
    });
  }, [adId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (!ad) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">No promotion found.</p>
      <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" /> Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div
          className="rounded-2xl overflow-hidden shadow-lg border border-border"
          style={{ backgroundColor: ad.bg_color || '#ffffff' }}
        >
          {/* Video */}
          {ad.video_url && (
            <video src={ad.video_url} controls className="w-full" />
          )}

          {/* Image */}
          {!ad.video_url && ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full"
              style={{ objectFit: 'contain' }}
              onError={e => e.target.style.display = 'none'}
            />
          )}

          <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold leading-tight" style={{ color: ad.text_color || '#111' }}>
              {ad.title}
            </h1>

            {ad.content && (
              <p className="text-base leading-relaxed" style={{ color: ad.text_color || '#111', opacity: 0.85 }}>
                {ad.content}
              </p>
            )}

            {ad.full_description && (
              <div className="pt-2 border-t" style={{ borderColor: `${ad.text_color || '#111'}22` }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: ad.text_color || '#111', opacity: 0.75 }}>
                  {ad.full_description}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 flex-wrap">
              {ad.contact_email && (
                <a
                  href={`mailto:${ad.contact_email}`}
                  className="text-sm underline"
                  style={{ color: ad.text_color || '#111' }}
                >
                  ✉ {ad.contact_email}
                </a>
              )}
              {ad.contact_phone && (
                <a
                  href={`tel:${ad.contact_phone}`}
                  className="text-sm underline"
                  style={{ color: ad.text_color || '#111' }}
                >
                  📞 {ad.contact_phone}
                </a>
              )}
              {ad.website_url && (
                <a
                  href={ad.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline flex items-center gap-1"
                  style={{ color: ad.text_color || '#111' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> {ad.website_url}
                </a>
              )}
            </div>

            <a
              href={ad.button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center py-3 rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90 mt-2"
              style={{ backgroundColor: ad.button_color || '#166534' }}
            >
              {ad.button_text || 'Learn More'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}