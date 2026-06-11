import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ReviewForm({ partnerId, partnerName, conversationId, user, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a review comment'); return; }
    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        partner_id: partnerId,
        reviewer_name: user?.full_name || user?.email || 'Anonymous',
        rating,
        comment: comment.trim(),
      });
      onSuccess?.();
    } catch (err) {
      toast.error('Failed to submit review');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Review *</Label>
        <Textarea
          placeholder="Share your experience working with this partner..."
          className="h-28 resize-none"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={submitting || !rating || !comment.trim()}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
}