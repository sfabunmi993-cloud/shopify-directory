import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function GenerateProfileImageButton({ partner, onGenerated }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!partner) return;
    setGenerating(true);
    try {
      const services = (partner.services || []).slice(0, 4).join(', ') || 'Shopify services';
      const prompt = `A modern, minimal logo mark for a Shopify partner agency named "${partner.name}". Services: ${services}.${partner.industry ? ` Industry: ${partner.industry}.` : ''} Clean flat vector style, centered, simple geometric shape or stylized monogram, professional, bold flat colors on a plain background, square format, no readable text.`;
      const res = await base44.integrations.Core.GenerateImage({ prompt });
      const url = res?.url;
      if (!url) {
        toast.error('Image generation failed. Try again.');
        return;
      }
      await base44.entities.Partner.update(partner.id, { logo_url: url });
      onGenerated?.(url);
      toast.success('Profile image generated!');
    } catch (err) {
      toast.error(err?.message || 'Failed to generate image.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={generating}
      className="flex items-center gap-2 px-3 py-2 border border-primary/30 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {generating ? 'Generating…' : 'Generate image'}
    </button>
  );
}