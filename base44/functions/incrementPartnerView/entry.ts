import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Increments the profile view (click) counter for a partner.
// Called from the partner detail page whenever it is viewed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id } = await req.json();

    if (!partner_id) {
      return Response.json({ error: 'partner_id required' }, { status: 400 });
    }

    const partner = await base44.asServiceRole.entities.Partner.get(partner_id);
    const newCount = (partner.profile_views || 0) + 1;
    await base44.asServiceRole.entities.Partner.update(partner_id, {
      profile_views: newCount,
    });

    return Response.json({ success: true, profile_views: newCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});