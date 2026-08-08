import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function StarPicker({ value, onChange, size = 'w-4 h-4' }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            className={`${size} ${(hover || value) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PortfolioItemReview({ partnerId, portfolioItemUrl }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 0, comment: '', reviewer_name: '' });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.Review.filter({ partner_id: partnerId });
        const filtered = all.filter((r) => r.portfolio_item_url === portfolioItemUrl);
        setReviews(filtered);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [partnerId, portfolioItemUrl]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to leave a review.');
      return;
    }
    if (form.rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await base44.entities.Review.create({
        partner_id: partnerId,
        portfolio_item_url: portfolioItemUrl,
        reviewer_name: form.reviewer_name.trim() || user?.full_name || 'Anonymous',
        rating: form.rating,
        comment: form.comment.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setForm({ rating: 0, comment: '', reviewer_name: '' });
      setShowForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="mt-2 border-t border-border pt-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {avg ? (
            <span className="font-medium">{avg}</span>
          ) : (
            <span className="text-muted-foreground">No reviews yet</span>
          )}
          {reviews.length > 0 && <span className="text-muted-foreground">({reviews.length})</span>}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <MessageSquare className="w-3 h-3" /> Review this work
        </button>
      </div>

      {showForm && (
        <div className="bg-muted/40 rounded-lg p-2.5 space-y-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Rating:</span>
            <StarPicker value={form.rating} onChange={(n) => setForm((p) => ({ ...p, rating: n }))} size="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={form.reviewer_name}
            onChange={(e) => setForm((p) => ({ ...p, reviewer_name: e.target.value }))}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs"
          />
          <textarea
            placeholder="Share your experience with this work..."
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs resize-none h-16"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium rounded-md px-3 py-1.5 hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Submit
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-muted-foreground px-2 py-1.5 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-1.5">
          {reviews.slice(0, 3).map((r) => (
            <div key={r.id} className="text-xs">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-3 h-3 ${n <= (r.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
                    />
                  ))}
                </div>
                <span className="font-medium">{r.reviewer_name || 'Anonymous'}</span>
              </div>
              {r.comment && <p className="text-muted-foreground mt-0.5 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}