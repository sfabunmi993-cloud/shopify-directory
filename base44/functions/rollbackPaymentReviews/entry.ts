import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Reverses the fulfillment of a payment when an admin rejects it.
// Removes the reviews that were generated for this payment and recomputes
// the partner's aggregate rating and review count.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const payment = body?.data || body;

    if (!payment || !payment.id) {
      return Response.json({ skipped: true, reason: 'no payment data' });
    }

    const partnerId = payment.partner_id;

    // Delete every review that was created for this payment.
    const linkedReviews = await base44.asServiceRole.entities.Review.filter({
      payment_id: payment.id,
    });
    for (const r of linkedReviews) {
      await base44.asServiceRole.entities.Review.delete(r.id);
    }

    // Recompute the partner's rating and review count from remaining reviews.
    if (partnerId) {
      const remaining = await base44.asServiceRole.entities.Review.filter({ partner_id: partnerId });
      const avg = remaining.length > 0
        ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
        : 0;
      await base44.asServiceRole.entities.Partner.update(partnerId, {
        rating: Math.round(avg * 10) / 10,
        review_count: remaining.length,
      });
    }

    return Response.json({
      success: true,
      payment_id: payment.id,
      removed_reviews: linkedReviews.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});