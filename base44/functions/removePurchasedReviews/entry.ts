import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Allows an admin to remove a specific number of purchased reviews from a
// partner's profile. Deletes the most recent purchased reviews first, then
// recomputes the partner's aggregate rating and review count.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { partner_id, count } = body?.data || body;

    if (!partner_id) {
      return Response.json({ error: 'partner_id is required' }, { status: 400 });
    }

    const n = Math.max(parseInt(count, 10) || 0, 0);
    if (n <= 0) {
      return Response.json({ error: 'count must be a positive number' }, { status: 400 });
    }

    // Fetch all purchased reviews for this partner (newest first).
    const purchased = await base44.asServiceRole.entities.Review.filter({
      partner_id,
      is_purchased: true,
    }, '-created_date', 500);

    if (purchased.length === 0) {
      return Response.json({ success: true, removed: 0, reason: 'no purchased reviews found' });
    }

    // Delete up to `n` of the most recent purchased reviews.
    const toRemove = purchased.slice(0, n);
    for (const r of toRemove) {
      await base44.asServiceRole.entities.Review.delete(r.id);
    }

    // Recompute the partner's rating and review count from remaining reviews.
    const remaining = await base44.asServiceRole.entities.Review.filter({ partner_id });
    const avg = remaining.length > 0
      ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
      : 0;
    await base44.asServiceRole.entities.Partner.update(partner_id, {
      rating: Math.round(avg * 10) / 10,
      review_count: remaining.length,
    });

    return Response.json({
      success: true,
      partner_id,
      removed: toRemove.length,
      remaining_reviews: remaining.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});