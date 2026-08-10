import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { pickReviews } from '../../shared/reviewPool.ts';

// Triggered automatically when a new Payment is created.
// Auto-approves the payment and fulfills it immediately:
//  - "Buy Reviews"  -> generates the purchased reviews + updates partner rating
//  - "Domain Purchase" -> marks partner domain_purchased + approved
//  - "Premium Badge" -> upgrades partner tier to premium
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const payment = body?.data || body;

    if (!payment || !payment.id) {
      return Response.json({ skipped: true, reason: 'no payment data' });
    }

    // Only fulfill payments still pending approval.
    if (payment.status && payment.status !== 'pending') {
      return Response.json({ skipped: true, reason: `status=${payment.status}` });
    }

    const description = (payment.description || '').toLowerCase();
    const partnerId = payment.partner_id;

    // 1. Approve the payment right away.
    await base44.asServiceRole.entities.Payment.update(payment.id, { status: 'approved' });

    // 2. Fulfill based on payment type.
    if (description.includes('buy reviews') && partnerId) {
      // Extract the review count, e.g. "Buy Reviews — 5 Reviews package (₦X)"
      const match = (payment.description || '').match(/(\d+)\s+reviews?\s+package/i);
      const count = match ? parseInt(match[1], 10) : 0;
      if (count > 0) {
        const templates = pickReviews(count);
        for (const r of templates) {
          await base44.asServiceRole.entities.Review.create({
            partner_id: partnerId,
            reviewer_name: r.name,
            rating: r.rating,
            comment: r.comment,
            is_purchased: true,
          });
        }
        // Recompute and store the partner rating.
        const allReviews = await base44.asServiceRole.entities.Review.filter({ partner_id: partnerId });
        const avg = allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;
        await base44.asServiceRole.entities.Partner.update(partnerId, {
          rating: Math.round(avg * 10) / 10,
          review_count: allReviews.length,
        });
      }
    } else if (description.includes('domain purchase') && partnerId) {
      await base44.asServiceRole.entities.Partner.update(partnerId, {
        domain_purchased: true,
        status: 'approved',
      });
    } else if (description.includes('premium badge') && partnerId) {
      await base44.asServiceRole.entities.Partner.update(partnerId, {
        partner_tier: 'premium',
      });
    }

    return Response.json({ success: true, payment_id: payment.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});