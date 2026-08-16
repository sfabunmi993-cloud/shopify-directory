import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X, Camera, Quote } from 'lucide-react';
import { toast } from 'sonner';

const MAX_TESTIMONIALS = 15;

export default function TestimonialsEditor({ testimonials = [], onChange }) {
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const handleUploadImage = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateItem(idx, { image_url: file_url });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploadingIdx(null);
    }
  };

  const addTestimonial = () => {
    if (testimonials.length >= MAX_TESTIMONIALS) {
      toast.error(`You can add up to ${MAX_TESTIMONIALS} testimonials`);
      return;
    }
    onChange([...testimonials, { image_url: '', text: '', author_name: '' }]);
  };

  const updateItem = (idx, patch) => {
    onChange(testimonials.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };

  const removeItem = (idx) => {
    onChange(testimonials.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Add client testimonials with a photo and quote. These scroll automatically on your public profile. {testimonials.length}/{MAX_TESTIMONIALS} used.
        </p>
      </div>

      {testimonials.length > 0 && (
        <div className="space-y-3">
          {testimonials.map((t, idx) => (
            <div key={idx} className="border border-border rounded-xl p-3 bg-muted/30 space-y-3">
              <div className="flex items-start gap-3">
                <label className="cursor-pointer shrink-0">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, idx)} disabled={uploadingIdx === idx} />
                  {t.image_url ? (
                    <img src={t.image_url} alt="Testimonial" className="w-14 h-14 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
                      {uploadingIdx === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    </div>
                  )}
                </label>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="text-xs">Author name</Label>
                    <Input
                      value={t.author_name || ''}
                      onChange={(e) => updateItem(idx, { author_name: e.target.value })}
                      placeholder="e.g. Jane Doe, CEO of BrandCo"
                      className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Testimonial</Label>
                    <Textarea
                      value={t.text || ''}
                      onChange={(e) => updateItem(idx, { text: e.target.value })}
                      placeholder="What the client said about your work..."
                      className="text-sm resize-none"
                      rows={2} />
                  </div>
                </div>
                <button
                  onClick={() => removeItem(idx)}
                  className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {testimonials.length < MAX_TESTIMONIALS && (
        <Button variant="outline" onClick={addTestimonial} className="rounded-full gap-1.5">
          <Plus className="w-4 h-4" /> Add testimonial
        </Button>
      )}

      {testimonials.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground">
          <Quote className="w-8 h-8 opacity-40" />
          <p className="text-sm">No testimonials yet</p>
          <Button variant="outline" size="sm" onClick={addTestimonial} className="rounded-full gap-1.5">
            <Plus className="w-4 h-4" /> Add your first testimonial
          </Button>
        </div>
      )}
    </div>
  );
}