import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Determine current month window (in UTC)
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthStartIso = monthStart.toISOString();
    const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Fetch admins to email
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) {
      return Response.json({ message: 'No admin users found' });
    }

    // Fetch partners and reviews (service role reads all records)
    const partners = await base44.asServiceRole.entities.Partner.list('-created_date', 500);
    const reviews = await base44.asServiceRole.entities.Review.list('-created_date', 500);

    const approvedPartners = partners.filter((p) => p.status === 'approved');

    // New signups this month (any status, by created_date)
    const newSignups = partners.filter((p) => p.created_date && new Date(p.created_date) >= monthStart);
    const newApprovedSignups = newSignups.filter((p) => p.status === 'approved');

    // Reviews this month
    const newReviews = reviews.filter((r) => r.created_date && new Date(r.created_date) >= monthStart);

    // Rating stats across approved partners that have ratings
    const ratedPartners = approvedPartners.filter((p) => p.rating > 0);
    const avgRating = ratedPartners.length > 0
      ? (ratedPartners.reduce((sum, p) => sum + (p.rating || 0), 0) / ratedPartners.length)
      : 0;

    // Top 5 partners by review count
    const topPartners = [...approvedPartners]
      .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
      .slice(0, 5)
      .map((p, i) => `${i + 1}. ${p.name} — ${p.rating || 0}★ (${p.review_count || 0} reviews)`);

    const subject = `Monthly Platform Report — ${monthLabel}`;
    const body = `
Here is your monthly platform report for ${monthLabel}.

PARTNERS
- Total approved partners: ${approvedPartners.length}
- New signups this month: ${newSignups.length}
  (of which approved: ${newApprovedSignups.length})
- Pending partner registrations: ${partners.filter((p) => p.status === 'pending').length}
- Restricted partners: ${partners.filter((p) => p.status === 'restricted').length}

REVIEWS & RATINGS
- Total reviews (all-time): ${reviews.length}
- New reviews this month: ${newReviews.length}
- Average partner rating: ${avgRating.toFixed(2)} / 5

TOP 5 PARTNERS BY REVIEWS
${topPartners.length > 0 ? topPartners.join('\n') : 'No reviewed partners yet.'}

Review these figures in your Admin Dashboard.
    `.trim();

    const emailPromises = admins.map((admin) =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject,
        body,
        from_name: 'Shopify Partner Base'
      })
    );

    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      notified: admins.length,
      stats: {
        month: monthLabel,
        total_approved_partners: approvedPartners.length,
        new_signups: newSignups.length,
        new_reviews: newReviews.length,
        avg_rating: Number(avgRating.toFixed(2))
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});