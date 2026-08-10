import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const partners = await base44.asServiceRole.entities.Partner.list('-profile_views', 200);

    const analyticsArray = partners
      .filter(p => p.status === 'approved')
      .map(p => ({
        partner_id: p.id,
        partner_name: p.name,
        slug: p.slug,
        total_users: p.profile_views || 0,
        rating: p.rating || 0,
        completed_projects: p.completed_projects || 0,
      }));

    return Response.json({
      success: true,
      data: analyticsArray,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});