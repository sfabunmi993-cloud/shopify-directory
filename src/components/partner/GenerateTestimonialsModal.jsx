import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Loader2, Sparkles, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const MAX_TESTIMONIALS = 15;

// Lightweight, varied object themes so each testimonial avatar looks distinct.
const AVATAR_THEMES = [
  'a single blooming flower',
  'a cute pet (cat or dog)',
  'a stylish handbag',
  'a potted houseplant',
  'a coffee cup with steam',
  'a pair of sneakers',
  'a wristwatch',
  'a smartphone',
  'a bicycle',
  'an open book',
  'a vintage camera',
  'a pair of glasses',
  'a wide-brim hat',
  'a pair of headphones',
  'a shopping cart',
];

const pick = (arr, i) => arr[i % arr.length];

export default function GenerateTestimonialsModal({ partner, isOpen, onClose, onGenerated }) {
  const [count, setCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(false);

  const remaining = MAX_TESTIMONIALS - (partner?.testimonials?.length || 0);
  const maxAllowed = Math.max(0, remaining);

  const handleGenerate = async () => {
    if (!partner) return;
    const toGenerate = Math.min(count, maxAllowed);
    if (toGenerate < 1) {
      toast.error('Testimonial carousel is full (15 max).');
      return;
    }
    setGenerating(true);
    setDone(false);
    try {
      const services = (partner.services || []).join(', ') || 'Shopify services';
      const desc = partner.description || partner.full_description || '';
      const prompt = `Generate ${toGenerate} realistic, varied client testimonials for "${partner.name}", a Shopify partner.${desc ? ` About: ${desc}.` : ''} Services offered: ${services}.${partner.location ? ` Location: ${partner.location}.` : ''} Each testimonial must sound like a genuine, specific client review (1-3 sentences, natural tone, mention a concrete outcome or service). Provide a realistic client name for each. Return JSON with a "testimonials" array of objects { "text", "author_name" }.`;

      setProgress('Writing testimonials…');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            testimonials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  author_name: { type: 'string' },
                },
                required: ['text'],
              },
            },
          },
          required: ['testimonials'],
        },
      });

      const generated = Array.isArray(res?.testimonials) ? res.testimonials : [];
      const clean = generated
        .filter((t) => t && typeof t.text === 'string' && t.text.trim())
        .slice(0, toGenerate)
        .map((t) => ({
          text: t.text.trim(),
          author_name: (t.author_name || 'Verified Client').trim(),
        }));

      if (clean.length === 0) {
        toast.error('No testimonials were generated. Try again.');
        setGenerating(false);
        setProgress('');
        return;
      }

      // Generate a unique themed avatar image for each testimonial in parallel.
      setProgress(`Generating ${clean.length} images…`);
      const themeStart = Math.floor(Math.random() * AVATAR_THEMES.length);
      const withImages = await Promise.all(
        clean.map(async (t, i) => {
          const theme = pick(AVATAR_THEMES, themeStart + i);
          try {
            const img = await base44.integrations.Core.GenerateImage({
              prompt: `A clean, minimal flat-illustration avatar icon of ${theme}, centered, soft pastel background, simple, professional, square, no text.`,
            });
            return { ...t, image_url: img?.url || '' };
          } catch (_) {
            return t;
          }
        })
      );

      const existing = partner.testimonials || [];
      const merged = [...existing, ...withImages].slice(0, MAX_TESTIMONIALS);

      setProgress('Saving…');
      await base44.entities.Partner.update(partner.id, { testimonials: merged });

      setDone(true);
      toast.success(`${clean.length} testimonial${clean.length === 1 ? '' : 's'} generated.`);
      onGenerated?.();
      setTimeout(() => {
        setDone(false);
        setProgress('');
        onClose();
      }, 1200);
    } catch (err) {
      toast.error(err?.message || 'Failed to generate testimonials.');
    } finally {
      setGenerating(false);
      setProgress('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-1.5rem)] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Generate testimonials
          </DialogTitle>
          <DialogDescription>
            AI writes realistic client testimonials from {partner?.name}'s profile and creates a unique avatar image for each.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold">Testimonials added!</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Number to generate</label>
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))} disabled={generating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxAllowed }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Carousel holds up to 15. {maxAllowed} slot{maxAllowed === 1 ? '' : 's'} remaining. Each gets a unique AI image.
              </p>
            </div>
            {generating && progress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> {progress}
              </div>
            )}
          </div>
        )}

        {!done && (
          <DialogFooter>
            <Button variant="ghost" onClick={onClose} disabled={generating}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating || maxAllowed < 1}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" /> Generate
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}