import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id } = await req.json();

    if (!partner_id) {
      return Response.json({ error: 'partner_id required' }, { status: 400 });
    }

    const allReviews = await base44.asServiceRole.entities.Review.filter({ partner_id });
    const avg = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await base44.asServiceRole.entities.Partner.update(partner_id, {
      rating: Math.round(avg * 10) / 10,
      review_count: allReviews.length
    });

    return Response.json({ success: true, rating: Math.round(avg * 10) / 10, review_count: allReviews.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});