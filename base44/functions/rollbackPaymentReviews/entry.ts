import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Reverses the fulfillment of a payment when an admin rejects it.
// Removes the reviews that were generated for this payment and recomputes
// the partner's aggregate rating and review count.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only admins may roll back payment reviews.
    let caller = null;
    try { caller = await base44.auth.me(); } catch {}
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    // Trust only the database: resolve the payment record by id.
    const paymentId = body?.data?.id || body?.id;
    if (!paymentId) {
      return Response.json({ skipped: true, reason: 'no payment reference' });
    }
    let payment;
    try {
      payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    } catch {
      return Response.json({ skipped: true, reason: 'payment not found' });
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