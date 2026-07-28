import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="focus:outline-none">
          <Star className={`w-7 h-7 transition-colors ${n <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ partnerId, onReviewAdded, unlimitedReviews, partnerStatus }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ reviewer_name: '', rating: 0, comment: '' });

  useEffect(() => {
    if (!partnerId) return;
    loadReviews();
    checkOwner();
  }, [partnerId]);

  // Re-run when unlimitedReviews resolves so DB-based limit check fires correctly
  useEffect(() => {
    if (!partnerId) return;
    loadReviews();
  }, [unlimitedReviews]);




  const DAILY_LIMIT = 6;

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Review.filter({ partner_id: partnerId }, '-created_date');
      setReviews(data);
      // Only count purchased reviews toward the daily limit
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const purchasedToday = data.filter(r => r.is_purchased && new Date(r.created_date) >= startOfToday).length;
      if (purchasedToday >= DAILY_LIMIT) setDailyLimitReached(true);
    } finally {
      setLoading(false);
    }
  };

  const checkOwner = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const user = await base44.auth.me();
      if (user?.full_name) setForm((prev) => ({ ...prev, reviewer_name: user.full_name }));
      if (user?.role === 'admin') setIsAdmin(true);
      const myPartners = await base44.entities.Partner.filter({ created_by_id: user.id });
      setIsOwner(myPartners.some((p) => p.id === partnerId));
    } catch (_) {}
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm(`Delete review by "${review.reviewer_name}"?`)) return;
    setDeletingId(review.id);
    await base44.entities.Review.delete(review.id);
    try { await base44.functions.invoke('updatePartnerRating', { partner_id: partnerId }); } catch (_) {}
    toast.success('Review deleted');
    await loadReviews();
    if (onReviewAdded) onReviewAdded();
    setDeletingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Please select a rating'); return; }
    if (!form.reviewer_name.trim()) { toast.error('Please enter your name'); return; }
    if (!partnerId) { toast.error('Partner not found'); return; }

    // Daily limit only applies to purchased reviews, not organic ones

    setSubmitting(true);
    try {
      await base44.entities.Review.create({ ...form, partner_id: partnerId, is_purchased: false });

      // Update partner rating (best-effort)
      try {
        await base44.functions.invoke('updatePartnerRating', { partner_id: partnerId });
      } catch (_) {}



      toast.success('Review submitted!');
      setSubmitted(true);
      setShowForm(false);
      setForm((prev) => ({ ...prev, rating: 0, comment: '' }));
      await loadReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : 0;

  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 mt-2">
        <div>
          <h2 className="font-heading text-lg font-semibold">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-4 h-4 ${n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{avgRating}</span>
              <span className="text-sm text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        {!isOwner && !showForm && (
          submitted || dailyLimitReached
            ? <div className="text-right">
                <span className="text-xs text-muted-foreground">✅ Review submitted</span>
                {dailyLimitReached && !submitted && (
                  <p className="text-xs text-amber-600 mt-0.5">Daily limit of {DAILY_LIMIT} reviews reached</p>
                )}
              </div>
            : <Button size="sm" className="rounded-full" onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-muted/30 rounded-xl border border-border space-y-4">
          <div className="space-y-1.5">
            <Label>Your name <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. John Smith"
              value={form.reviewer_name}
              onChange={(e) => setForm((prev) => ({ ...prev, reviewer_name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Rating <span className="text-destructive">*</span></Label>
            <StarPicker value={form.rating} onChange={(v) => setForm((prev) => ({ ...prev, rating: v }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Your review</Label>
            <Textarea
              placeholder="Share your experience working with this partner..."
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              className="h-24 resize-none" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="rounded-full" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Submitting...</> : 'Submit Review'}
            </Button>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first to leave one!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-xs">
                      {(review.reviewer_name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{review.reviewer_name || 'Anonymous'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                    ))}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteReview(review)}
                      disabled={deletingId === review.id}
                      className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete review"
                    >
                      {deletingId === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground mt-2 ml-10 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}