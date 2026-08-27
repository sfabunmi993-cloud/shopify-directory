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
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const MAX_TESTIMONIALS = 15;

export default function GenerateTestimonialsModal({ partner, isOpen, onClose, onGenerated }) {
  const [count, setCount] = useState(3);
  const [generating, setGenerating] = useState(false);
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
        return;
      }

      const existing = partner.testimonials || [];
      const merged = [...existing, ...clean].slice(0, MAX_TESTIMONIALS);

      await base44.entities.Partner.update(partner.id, { testimonials: merged });

      setDone(true);
      toast.success(`${clean.length} testimonial${clean.length === 1 ? '' : 's'} generated.`);
      onGenerated?.();
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1200);
    } catch (err) {
      toast.error(err?.message || 'Failed to generate testimonials.');
    } finally {
      setGenerating(false);
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
            AI will write realistic client testimonials from {partner?.name}'s profile and add them to the carousel.
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
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
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
                Carousel holds up to 15. {maxAllowed} slot{maxAllowed === 1 ? '' : 's'} remaining.
              </p>
            </div>
          </div>
        )}

        {!done && (
          <DialogFooter>
            <Button variant="ghost" onClick={onClose} disabled={generating}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating || maxAllowed < 1}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating...
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